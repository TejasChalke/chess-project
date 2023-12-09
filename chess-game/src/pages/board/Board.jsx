import { useEffect, useState } from 'react'
import './Board.scss'
import Pieces from '../../misc/Pieces';

const files = "abcdefgh";
const defaultBoardState = {
    whiteToMove: true,
    botTurn: false,
    from: -1,
    promoteToWhite: 'Q',
    promoteToBlack: 'q'
};

export default function Board(){
    const [squares, setSquares] = useState([]);
    const [settings, setSettings] = useState({
        gameType: -1,
        rotateBoard: false
    });
    const [boardState, setBoardState] = useState(defaultBoardState);

    const [movesSet, setMovesSet] = useState(false);
    const [legalMoves, setLegalMoves] = useState(Array(64).fill([]));
    

    // initial setup
    useEffect(() => {
        let temp = []
        for(let rank = 0; rank < 8; rank++){
            for(let file = 0; file < 8; file++){
                temp.push({
                    color: (rank + file) % 2 === 0 ? "#769656" : "#eeeed2",
                    textColor: (rank + file) % 2 !== 0 ? "#769656" : "#eeeed2",
                    xOffset: file * 80,
                    yOffset: rank * 80,
                    image: null,
                    piece: Pieces.None,
                    showMoveIcon: false,
                    displayRank: file === 0 ? (rank + 1).toString() : "",
                    displayFile: rank === 0 ? files[file] : ""
                })
            }
        }

        setSquares(temp);
    }, [])


    // for playing bot move
    useEffect(() => {
        async function playBotMove(){
            const response = await fetch("http://localhost:8080/playmove");
    
            if(!response.ok){
                console.log("Error playing bot move on the server!");
                return;
            }
    
            const currentLegalMove = await response.json();
            if(currentLegalMove.from < 0){
                if(currentLegalMove.from === -1){
                    // -1 for checkmate
                    console.log("checkmate");
                }else{
                    // -2 for stalemate
                    console.log("stalemate");
                }

                return;
            }
            console.log("Bot move: ", currentLegalMove);

            const from = currentLegalMove.from, to = currentLegalMove.to, currentFLag = currentLegalMove.currentFlag;
            const squaresCopy = [...squares];

            squaresCopy[to].piece = squaresCopy[from].piece;
            squaresCopy[to].image = squaresCopy[from].image;

            squaresCopy[from].piece = Pieces.None;
            squaresCopy[from].image = null;

            if(currentFLag === "EN_PASSANT"){
                let epPawnIndex = to + (boardState.whiteToMove ? -8 : 8);
                squaresCopy[epPawnIndex].piece = Pieces.None;
                squaresCopy[epPawnIndex].image = null;

            } else if(currentFLag === "CASTLE_KING_SIDE"){
                squaresCopy[to - 1].piece = squaresCopy[to + 1].piece;
                squaresCopy[to - 1].image = squaresCopy[to + 1].image;

                squaresCopy[to + 1].piece = Pieces.None;
                squaresCopy[to + 1].image = null;

            } else if(currentFLag === "CASTLE_QUEEN_SIDE") {
                squaresCopy[to + 1].piece = squaresCopy[to - 2].piece;
                squaresCopy[to + 1].image = squaresCopy[to - 2].image;
                
                squaresCopy[to - 2].piece = Pieces.None;
                squaresCopy[to - 2].image = null;

            } else if(currentFLag === "PROMOTE_TO_QUEEN" || currentFLag === "PROMOTE_TO_ROOK" || currentFLag === "PROMOTE_TO_BISHOP" || currentFLag === "PROMOTE_TO_KNIGHT"){
                let currentCharacter = 'Q';

                if(currentFLag === "PROMOTE_TO_ROOK") currentCharacter = 'R';
                else if(currentFLag === "PROMOTE_TO_BISHOP") currentCharacter = 'b';
                else if(currentFLag === "PROMOTE_TO_KNIGHT") currentCharacter = 'n';

                if(!boardState.whiteToMove) currentCharacter = currentCharacter.toLowerCase();

                let promotionPiece = Pieces.charToNumber.get(currentCharacter);

                squaresCopy[to].piece = promotionPiece;
                squaresCopy[to].image = Pieces.charToImage.get(currentCharacter);
            }
            
            setBoardState(prev => {
                let temp = {...prev};
                temp.botTurn = false;
                temp.whiteToMove = !temp.whiteToMove;
                temp.from = -1;
                
                return temp;
            })
            setMovesSet(false);
            setSquares(squaresCopy);
        }

        if(boardState.botTurn){
            playBotMove();
        }
    }, [boardState.botTurn, boardState.whiteToMove, squares])

    function resetBoard(currSettings){
        let temp = [];
        for(let rank=0; rank<8; rank++){
            for(let file=0; file<8; file++){
                temp.push({
                    color: (rank + file) % 2 === 0 ? "#769656" : "#eeeed2",
                    textColor: (rank + file) % 2 !== 0 ? "#769656" : "#eeeed2",
                    xOffset: file * 80,
                    yOffset: rank * 80,
                    image: null,
                    piece: Pieces.None,
                    showMoveIcon: false,
                    displayRank: file === 0 ? (rank + 1).toString() : "",
                    displayFile: rank === 0 ? files[file] : ""
                })
            }
        }

        if(currSettings.gameType === -1){
            setSquares(temp);
            setBoardState(defaultBoardState);
            setSettings(currSettings);
            setMovesSet(false);
            return;
        }

        let file = 0, rank = 7;
        const pieces = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".split(' ')[0];
        // const pieces = "k/8/8/8/8/8/1Q5/K6 w - - 0 1".split(' ')[0];
        const text = "rnbqkbnrpRNBQKBNRP", numbers = "0123456789";

        pieces.split('').forEach(curr => {
            if(text.indexOf(curr) !== -1){
                const index = rank * 8 + file;
                temp[index].image = Pieces.charToImage.get(curr);
                temp[index].piece = Pieces.charToNumber.get(curr);
                file++;
            }else if(numbers.indexOf(curr) !== -1){
                file += parseInt(curr);
            }else{
                rank--;
                file = 0;
            }
        });

        let nextBoardState = defaultBoardState;

        if(currSettings.gameType === 2) nextBoardState.botTurn = true;
    
        setSquares(temp);
        setBoardState(nextBoardState);
        setSettings(currSettings);
        setMovesSet(false);
    }

    function changePawnToPromote(color, piece){
        let temp = {...boardState};
        console.log(color, piece, temp);

        if(color === "black"){
            temp.promoteToBlack = piece;
        }else{
            temp.promoteToWhite = piece;
        }

        console.log(temp);

        setBoardState(temp);
    }

    async function startGame(){
        const type = parseInt(document.querySelector("#typeInput").value);

        if(isNaN(type) || type < 0 || type > 3) return;
        
        let temp = {
            gameType: -1,
            rotateBoard: false
        };
        temp.gameType = parseInt(type);

        const response = await fetch("http://localhost:8080/setboard");

        if(!response.ok){
            console.log("Error setting board on the server");
            return;
        }
        
        console.log("Board set on the server!");

        if(temp.gameType === 1){
            temp.rotateBoard = false;
        }else if(temp.gameType === 2){
            temp.rotateBoard = true;
        }
        
        document.querySelector("#typeInput").value = "";
        resetBoard(temp);
    }

    async function movePiece(index){
        const targetPiece = squares[index].piece;

        if(boardState.from === -1){
            if(Pieces.isNone(targetPiece) || (boardState.whiteToMove && Pieces.isBlack(targetPiece)) || (!boardState.whiteToMove && Pieces.isWhite(targetPiece))) return;

            if(legalMoves[index].length === 0) return;
            showLegalMoves(index);
        }else{
            if((boardState.whiteToMove && Pieces.isWhite(targetPiece)) || (!boardState.whiteToMove && Pieces.isBlack(targetPiece))){
                if(legalMoves[index].length === 0) return;

                showLegalMoves(index);
                return;
            }
            
            let currentLegalMove = {}, moveToMake = {};
            legalMoves[boardState.from].forEach(move => {
                if(move.to === index) currentLegalMove = move;
            });

            const from = currentLegalMove.from, to = currentLegalMove.to, currentFLag = currentLegalMove.currentFlag;
            moveToMake = currentLegalMove;
            const squaresCopy = [...squares];

            squaresCopy[to].piece = squaresCopy[from].piece;
            squaresCopy[to].image = squaresCopy[from].image;

            squaresCopy[from].piece = Pieces.None;
            squaresCopy[from].image = null;

            if(currentFLag === "EN_PASSANT"){
                let epPawnIndex = to + (boardState.whiteToMove ? -8 : 8);
                squaresCopy[epPawnIndex].piece = Pieces.None;
                squaresCopy[epPawnIndex].image = null;

            } else if(currentFLag === "CASTLE_KING_SIDE"){
                squaresCopy[to - 1].piece = squaresCopy[to + 1].piece;
                squaresCopy[to - 1].image = squaresCopy[to + 1].image;

                squaresCopy[to + 1].piece = Pieces.None;
                squaresCopy[to + 1].image = null;

            } else if(currentFLag === "CASTLE_QUEEN_SIDE") {
                squaresCopy[to + 1].piece = squaresCopy[to - 2].piece;
                squaresCopy[to + 1].image = squaresCopy[to - 2].image;
                
                squaresCopy[to - 2].piece = Pieces.None;
                squaresCopy[to - 2].image = null;

            } else if(currentFLag === "PROMOTE_TO_QUEEN" || currentFLag === "PROMOTE_TO_ROOK" || currentFLag === "PROMOTE_TO_BISHOP" || currentFLag === "PROMOTE_TO_KNIGHT"){
                console.log("here")
                let currentCharacter = boardState.whiteToMove ? boardState.promoteToWhite : boardState.promoteToBlack;
                let promotionPiece = Pieces.charToNumber.get(currentCharacter);

                squaresCopy[to].piece = promotionPiece;
                squaresCopy[to].image = Pieces.charToImage.get(currentCharacter);

                if(currentCharacter === 'Q' || currentCharacter === 'q') moveToMake.currentFlag = "PROMOTE_TO_QUEEN";
                else if(currentCharacter === 'R' || currentCharacter === 'r') moveToMake.currentFlag = "PROMOTE_TO_ROOK";
                else if(currentCharacter === 'B' || currentCharacter === 'b') moveToMake.currentFlag = "PROMOTE_TO_BISHOP";
                else if(currentCharacter === 'N' || currentCharacter === 'n') moveToMake.currentFlag = "PROMOTE_TO_KNIGHT";
            }

            // make move on the server
            const response = await fetch("http://localhost:8080/makemove", {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(moveToMake)
            });

            if(!response.ok){
                console.log("Move not reflected on the server!");
                return;
            }

            console.log("Move made on the server!");

            // flip turn
            setBoardState(prev => {
                let temp = {...prev};
                temp.whiteToMove = !temp.whiteToMove;
                temp.from = -1;
                temp.botTurn = true;

                return temp;
            });


            // reset show move icons and update the piece positions
            for(let i=0; i<64; i++) squaresCopy[i].showMoveIcon = false;
            setSquares(squaresCopy);
        }
    }

    function showLegalMoves(index){
        let temp = squares.map(square => {
            return {...square, showMoveIcon: false};
        })

        legalMoves[index].forEach(move => {
            temp[move.to].showMoveIcon = true;
        })

        setSquares(temp);
        setBoardState(prev => {
            return {...prev, from: index};
        });
    }

    async function getLegalMoves(){
        const response = await fetch("http://localhost:8080/getlegalmoves");

        if(!response.ok) {
            console.log("Error getting legal moves");
            return;
        }

        const res = await response.json();

        let temp = Array(64);
        for (let i = 0; i < 64; i++) {
            temp[i] = [];
        }

        if(res.length === 1 && res[0].from < 0){
            if(res[0].from === -1){
                console.log("Player lost Checkmate!");
            } else {
                console.log("Draw by stalemate");
            }
        } else {
            for(let i=0; i<res.length; i++){
                let index = res[i].from;
                temp[index].push(res[i]);
            }
        }

        
        setLegalMoves(temp);
        setMovesSet(true);
    }

    if(settings.gameType !== -1 && !boardState.botTurn && !movesSet){
        getLegalMoves();
    }

    return(
        <div id="mainContainer">
            <div id="settings">
                <div id="pawnPromotion">
                    <div id="promotionTitle">Select promotion piece:</div>
                    {
                        !boardState.whiteToMove &&
                        <div className="pieceImages">
                            <img src="/images/BlackQueen.png" alt="" onClick={() => {changePawnToPromote("black", 'q')}}/>
                            <img src="/images/BlackRook.png" alt="" onClick={() => {changePawnToPromote("black", 'r')}}/>
                            <img src="/images/BlackBishop.png" alt="" onClick={() => {changePawnToPromote("black", 'b')}}/>
                            <img src="/images/BlackKnight.png" alt="" onClick={() => {changePawnToPromote("black", 'n')}}/>
                        </div>
                    }

                    {
                        boardState.whiteToMove &&
                        <div className="pieceImages">
                            <img src="/images/WhiteQueen.png" alt="" onClick={() => {changePawnToPromote("white", 'Q')}}/>
                            <img src="/images/WhiteRook.png" alt="" onClick={() => {changePawnToPromote("white", 'R')}}/>
                            <img src="/images/WhiteBishop.png" alt="" onClick={() => {changePawnToPromote("white", 'B')}}/>
                            <img src="/images/WhiteKnight.png" alt="" onClick={() => {changePawnToPromote("white", 'N')}}/>
                        </div>
                    }
                </div>

                <div id="options">
                    <ol>
                        <li>White vs Computer</li>
                        <li>Black vs Computer</li>
                        <li>2 Player</li>
                    </ol>
                    <input type="text" name="" id="typeInput" />

                    <div className="buttons">
                        <div
                            className="btn"
                            onClick={() => {
                                startGame();
                            }}
                            > Start
                        </div>
                        <div
                            className="btn"
                            onClick={() => {
                                resetBoard({
                                    gameType: -1,
                                    rotateBoard: false
                                });
                            }}> Reset
                        </div>
                    </div>
                </div>
            </div>
            <div id="boardContainer">
                <div id="board" className={settings.rotateBoard ? "rotate" : ""}>
                {
                        squares.map((square, index) => {
                            const currStyle = {
                                bottom: square.yOffset,
                                left: square.xOffset,
                                backgroundColor: square.color,
                                color: square.textColor
                            }
                            
                            return(
                                <div
                                className={settings.rotateBoard ? "square rotate" : "square"}
                                key={index}
                                style={currStyle}
                                onClick={() => movePiece(index)}
                                >
                                    {
                                        square.displayRank.length > 0 && 
                                        <p className='label top-left'>{square.displayRank}</p>
                                    }
                                    {
                                        square.displayFile.length > 0 && 
                                        <p className='label bottom-right'>{square.displayFile}</p>
                                    }
                                    {
                                        square.image !== null && <img src={`/images/${square.image}.png`} alt={square.image} />
                                    }
                                    {
                                        square.showMoveIcon && square.image === null &&
                                        <div className='moveCircle'></div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}