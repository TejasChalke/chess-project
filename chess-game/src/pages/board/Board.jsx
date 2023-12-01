import { useEffect, useState } from 'react'
import Pieces from '../../misc/Pieces';
import General from '../../misc/General';
import './Board.scss'

const alphabets = "abcdefgh";
// gameTypes
// 0 for Testing
// 1 for White vs Computer
// 2 for Black vs Computer
// 3 for 2 Player

export default function Board(){
    const [squares, setSquares] = useState([]);
    const [legalMoves, setLegalMoves] = useState(Array(64).fill([]));
    const [boardState, setBoardState] = useState({
        turn: Pieces.White,
        from: -1,
        castling: "kqKQ",
        enPassant: -1,
        promoteTo: 'Q'
    })
    const [pawnToPromote, setPawnToPromote] = useState({
        white: 'Q',
        black: 'q'
    });
    const [settings, setSettings] = useState({
        gameType: -1,
        rotateBoard: false
    })


    // initial board setup
    useEffect(() => {
        let temp = [];
        for(let rank=0; rank<8; rank++){
            for(let file=0; file<8; file++){
                temp.push({
                    color: (rank + file) % 2 === 0 ? "#769656" : "#eeeed2",
                    xOffset: file * 80,
                    yOffset: rank * 80,
                    image: "none",
                    piece: Pieces.None,
                    showMoveIcon: false,
                    text: ""
                })
            }
        }

        for(let file=0; file<8; file++){
            temp.push({
                color: "#f7f7f700",
                xOffset: file * 80,
                yOffset: -55,
                image: "none",
                piece: Pieces.None,
                showMoveIcon: false,
                text: alphabets[file]
            })
        }

        for(let rank=0; rank<8; rank++){
            temp.push({
                color: "#f7f7f700",
                xOffset: -55,
                yOffset: rank * 80,
                image: "none",
                piece: Pieces.None,
                showMoveIcon: false,
                text: (rank + 1).toString()
            })
        }

        setSquares(temp);
        setBoardState({
            turn: Pieces.White,
            from: -1,
            castling: "kqKQ",
            enPassant: -1,
            promoteTo: 'Q'
        });
        setLegalMoves(Array(64).fill([]));
        setPawnToPromote({
            white: 'Q',
            black: 'q'
        });
    }, [])


    // check for checkmate or stalemate
    useEffect(() => {
        if(settings.gameType === -1) return;
        let hasMoves = false;
        legalMoves.forEach(moves => {
            if(moves.length > 0){
                hasMoves = true;
            }
        });

        if(!hasMoves){
            let indexToCheck = -1;
            for(let i=0; i<64; i++){
                if(Pieces.isSameColor(squares[i].piece, boardState.turn) && Pieces.isKing(squares[i].piece)){
                    indexToCheck = i;
                    break;
                }
            }

            if(General.isSquareAttacked(boardState.turn, JSON.parse(JSON.stringify(squares)), indexToCheck)) console.log("Checkmate");
            else console.log("Stalemate");
        }

    }, [legalMoves, boardState.turn, settings.gameType, squares])

    function resetBoard(currSettings){
        let temp = [];
        for(let rank=0; rank<8; rank++){
            for(let file=0; file<8; file++){
                temp.push({
                    color: (rank + file) % 2 === 0 ? "#769656" : "#eeeed2",
                    xOffset: file * 80,
                    yOffset: rank * 80,
                    image: "none",
                    piece: Pieces.None,
                    showMoveIcon: false,
                    text: ""
                })
            }
        }

        for(let file=0; file<8; file++){
            temp.push({
                color: "#f7f7f700",
                xOffset: file * 80,
                yOffset: -55,
                image: "none",
                piece: Pieces.None,
                showMoveIcon: false,
                text: alphabets[file]
            })
        }

        for(let rank=0; rank<8; rank++){
            temp.push({
                color: "#f7f7f700",
                xOffset: -55,
                yOffset: rank * 80,
                image: "none",
                piece: Pieces.None,
                showMoveIcon: false,
                text: (rank + 1).toString()
            })
        }

        if(currSettings.gameType === -1){
            setSquares(temp);
            setBoardState({
                turn: Pieces.White,
                from: -1,
                castling: "kqKQ",
                enPassant: -1,
                promoteTo: 'Q'
            });
            setLegalMoves(Array(64).fill([]));
            setPawnToPromote({
                white: 'Q',
                black: 'q'
            });
            setSettings(currSettings);
            return;
        }

        let file = 0, rank = 7;
        const pieces = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".split(' ')[0];
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
    
        setSquares(temp);
        setBoardState({
            turn: Pieces.White,
            from: -1,
            castling: "kqKQ",
            enPassant: -1,
            promoteTo: 'Q'
        });
        setLegalMoves(General.generateLegalMoves(JSON.parse(JSON.stringify(temp)), JSON.parse(JSON.stringify({
            turn: Pieces.White,
            from: -1,
            castling: "kqKQ",
            enPassant: -1,
            promoteTo: 'Q'
        }))));
        setPawnToPromote({
            white: 'Q',
            black: 'q'
        });
        setSettings(currSettings);
    }

    function movePiece(index, square){
        // console.log(boardState, Math.floor(index/8) + ", " + index%8 + " : " + square.piece);
        // cannot move opponents pieces
        if(square.piece !== Pieces.None && (!Pieces.isSameColor(square.piece, boardState.turn) && boardState.from === -1)) return;

        if(boardState.from === -1){
            // not selected a piece previously

            // square is empty
            if(square.piece === Pieces.None) return;

            setBoardState(prev => {
                prev.from = index;
                
                return prev;
            })
            
            // const legalMoves = General.generateMoves(square.piece, index, boardState, squares);
            let temp = [...squares]
            for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

            legalMoves[index].forEach(val => {
                if(temp[val]) temp[val].showMoveIcon = true;
            })

            setSquares(temp);
            
        }else{
            if((square.piece !== Pieces.None) && Pieces.isSameColor(square.piece, boardState.turn)){
                // if selecting pieces of same color
                setBoardState(prev => {
                    prev.from = index;
                    return prev;
                })

                // const legalMoves = General.generateMoves(square.piece, index, boardState, squares);
                let temp = [...squares]
                for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

                legalMoves[index].forEach(val => {
                    temp[val].showMoveIcon = true;
                })

                setSquares(temp);
            }else{
                var legal = false;
                legalMoves[boardState.from].forEach(target => {
                    if(target === index) legal = true;
                })
                if(!legal) return;

                let boardStateCopy = JSON.parse(JSON.stringify(boardState));
                // opposite color or empty circle
                if(Pieces.isPawn(squares[boardState.from].piece)){
                    // wait for user to click on an icon
                    // based on the icnon set the property of boardStateCopy.promoteTo
                    if(Math.floor(index / 8) === 7){
                        boardStateCopy.promoteTo = pawnToPromote.white;
                    }else if(Math.floor(index / 8) === 0){
                        boardStateCopy.promoteTo = pawnToPromote.black;
                    }else{
                        boardStateCopy.promoteTo = 'K';
                    }
                }

                const res = General.makeMove(index, boardStateCopy, JSON.parse(JSON.stringify(squares)));
                
                setLegalMoves(General.generateLegalMoves(JSON.parse(JSON.stringify(res.nextSquareState)), JSON.parse(JSON.stringify(res.nextBoardState))));
                setBoardState(res.nextBoardState);
                setSquares(res.nextSquareState);

                if(settings.gameType === 3){
                    let prev = {...settings};
                    prev.rotateBoard = !prev.rotateBoard;

                    setSettings(prev);
                }
            }
        }
    }

    function changePawnToPromote(color, piece){
        if(color === "white"){
            setPawnToPromote(prev => {
                let temp = {...prev};
                temp.white = piece;
                return temp;
            })
        }else{
            setPawnToPromote(prev => {
                let temp = {...prev};
                temp.black = piece;
                return temp;
            })
        }
    }

    // function setCustomBoard(){
    //     let temp = [];
    //     for(let rank=0; rank<8; rank++){
    //         for(let file=0; file<8; file++){
    //             temp.push({
    //                 color: (rank + file) % 2 === 0 ? "#769656" : "#eeeed2",
    //                 xOffset: file * 80,
    //                 yOffset: rank * 80,
    //                 image: "none",
    //                 piece: Pieces.None,
    //                 showMoveIcon: false,
    //                 text: ""
    //             })
    //         }
    //     }

    //     for(let file=0; file<8; file++){
    //         temp.push({
    //             color: "#f7f7f700",
    //             xOffset: file * 80,
    //             yOffset: -55,
    //             image: "none",
    //             piece: Pieces.None,
    //             showMoveIcon: false,
    //             text: alphabets[file]
    //         })
    //     }

    //     for(let rank=0; rank<8; rank++){
    //         temp.push({
    //             color: "#f7f7f700",
    //             xOffset: -55,
    //             yOffset: rank * 80,
    //             image: "none",
    //             piece: Pieces.None,
    //             showMoveIcon: false,
    //             text: (rank + 1).toString()
    //         })
    //     }

    //     let file = 0, rank = 7;
    //     // "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    //     // const pieces = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".split(' ')[0];
    //     const pieces = "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1".split(' ')[0];
    //     const text = "rnbqkbnrpRNBQKBNRP", numbers = "0123456789";

    //     pieces.split('').forEach(curr => {
    //         if(text.indexOf(curr) !== -1){
    //             const index = rank * 8 + file;
    //             temp[index].image = Pieces.charToImage.get(curr);
    //             temp[index].piece = Pieces.charToNumber.get(curr);
    //             file++;
    //         }else if(numbers.indexOf(curr) !== -1){
    //             file += parseInt(curr);
    //         }else{
    //             rank--;
    //             file = 0;
    //         }
    //     });
    
    //     setSquares(temp);
    //     setBoardState({
    //         turn: Pieces.White,
    //         from: -1,
    //         castling: "",
    //         enPassant: -1,
    //         promoteTo: 'Q'
    //     });
    //     setLegalMoves(General.generateLegalMoves(JSON.parse(JSON.stringify(temp)), JSON.parse(JSON.stringify({
    //         turn: Pieces.White,
    //         from: -1,
    //         castling: "",
    //         enPassant: -1,
    //         promoteTo: 'Q'
    //     }))));
    //     setPawnToPromote({
    //         white: 'Q',
    //         black: 'q'
    //     });
    //     setSettings({
    //         gameType: 0,
    //         rotateBoard: false
    //     })
    // }

    function startGame(){
        const type = parseInt(document.querySelector("#typeInput").value);

        if(isNaN(type) || type < 0 || type > 3) return;
        
        let temp = {...settings};
        temp.gameType = parseInt(type);
        if(type === 2) temp.rotateBoard = true;
        else temp.rotateBoard = false;
        
        document.querySelector("#typeInput").value = "";
        resetBoard(temp);
    }

    async function getBotMove(){
        let pieces = []
        for(let i=0; i < 64; i++){
            pieces.push(squares[i].piece);
        }

        let data = {
            pieces: pieces,
            boardState: {
                toPlay: boardState.turn,
                castling: boardState.castling,
                enPassant: boardState.enPassant 
            }
        }

        const response = await fetch('http://localhost:8080/getmove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if(response.ok){
            const res = await response.text();

            console.log(res);
        }else{
            console.log("error getting move");
        }
    }

    // playing with bot
    // bot's turn to play}
    if((settings.gameType === 1 && boardState.turn === Pieces.Black) ||
    (settings.gameType === 2 && boardState.turn === Pieces.White)){
        getBotMove();
    }

    return(
        <>
            <div className="boardConatiner">
                <div id="pawnPromotion">
                    {
                        boardState.turn === Pieces.Black &&
                        <div className="pieceImages">
                            <img src="/images/BlackQueen.png" alt="" onClick={() => {changePawnToPromote("black", 'q')}}/>
                            <img src="/images/BlackRook.png" alt="" onClick={() => {changePawnToPromote("black", 'r')}}/>
                            <img src="/images/BlackBishop.png" alt="" onClick={() => {changePawnToPromote("black", 'b')}}/>
                            <img src="/images/BlackKnight.png" alt="" onClick={() => {changePawnToPromote("black", 'n')}}/>
                        </div>
                    }

                    {
                        boardState.turn === Pieces.White &&
                        <div className="pieceImages">
                            <img src="/images/WhiteQueen.png" alt="" onClick={() => {changePawnToPromote("white", 'Q')}}/>
                            <img src="/images/WhiteRook.png" alt="" onClick={() => {changePawnToPromote("white", 'R')}}/>
                            <img src="/images/WhiteBishop.png" alt="" onClick={() => {changePawnToPromote("white", 'B')}}/>
                            <img src="/images/WhiteKnight.png" alt="" onClick={() => {changePawnToPromote("white", 'N')}}/>
                        </div>
                    }
                </div>
                <div
                    className="options"
                >
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
                <div
                    className="ui2"
                    onClick={() => {
                        // setCustomBoard();
                        getBotMove();
                    }}
                >
                    
                </div>
                <div className={settings.rotateBoard ? "board rotate" : "board"}>
                    {
                        squares.map((square, index) => {
                            const currStyle = {
                                bottom: square.yOffset,
                                left: square.xOffset,
                                backgroundColor: square.color,
                            }

                            const paraStyle = {
                                textAlign: "center"
                            }
                            
                            return(
                                <div
                                className={settings.rotateBoard ? "square rotate" : "square"}
                                key={index}
                                style={currStyle}
                                onClick={() => movePiece(index, square)}
                                >
                                    {
                                        square.text.length > 0 && 
                                        <p className='label' style={paraStyle}>{square.text}</p>
                                    }
                                    {
                                        square.image !== "none" && <img src={`/images/${square.image}.png`} alt={square.image} />
                                    }
                                    {
                                        square.showMoveIcon && square.image === "none" &&
                                        <div className='moveCircle'></div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}