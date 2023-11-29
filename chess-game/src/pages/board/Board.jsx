import { useEffect, useState } from 'react'
import Pieces from '../../misc/Pieces';
import './Board.scss'

const alphabets = "abcdefgh";

export default function Board(){
    const [squares, setSquares] = useState([]);
    const [move, setMove] = useState({
        turn: 8,
        from: -1
    })

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
        setMove({
            turn: 8,
            from: -1
        });
    }, [])

    function resetBoard(){
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

        let file = 0, rank = 7;
        const pieces = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".split(' ')[0];
        const text = "rnbqkbnrpRNBQKBNRP", numbers = "0123456789";

        pieces.split('').forEach(curr => {
            if(text.indexOf(curr) !== -1){
                const index = rank * 8 + file;
                temp[index].image = Pieces.charToImage.get(curr);
                temp[index].piece = Pieces.charToNumber.get(curr);
                console.log(curr, index, temp[index]);
                file++;
            }else if(numbers.indexOf(curr) !== -1){
                file += parseInt(curr);
            }else{
                rank--;
                file = 0;
            }
        });
    
        setSquares(temp);
        setMove({
            turn: 8,
            from: -1
        });
    }

    function movePiece(index, square){
        console.log(move, Math.floor(index/8) + ", " + index%8 + " : " + square.piece);
        // cannot move opponents pieces
        if(square.piece !== Pieces.None && (!Pieces.isSameColor(square.piece, move.turn) && move.from === -1)) return;

        if(move.from === -1){
            // not selected a piece previously

            // square is empty
            if(square.piece === Pieces.None) return;

            setMove(prev => {
                prev.from = index;
                
                return prev;
            })
            
            const legalMoves = getLegalMoves(square.piece, index);
            let temp = [...squares]
            for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

            legalMoves.forEach(val => {
                temp[val].showMoveIcon = true;
            })

            setSquares(temp);
            
        }else{
            if((square.piece !== Pieces.None) && Pieces.isSameColor(square.piece, move.turn)){
                // if selecting pieces of same color
                setMove(prev => {
                    prev.from = index;
                    return prev;
                })

                const legalMoves = getLegalMoves(square.piece, index);
                let temp = [...squares]
                for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

                legalMoves.forEach(val => {
                    temp[val].showMoveIcon = true;
                })

                setSquares(temp);
            }else{
                if(square.piece === Pieces.None){
                    // if the target square is empty
                    if(!square.showMoveIcon) return;
                    resetLegalMoves();

                    let temp = [...squares]
                    temp[index].piece = temp[move.from].piece;
                    temp[index].image = temp[move.from].image;

                    temp[move.from].piece = Pieces.None;
                    temp[move.from].image = "none";

                    setSquares(temp)

                    setMove(prev => {
                        let temp = {...prev}
                        temp.turn = temp.turn === 16 ? 8 : 16;
                        temp.from = -1;
                        return temp;
                    })
                }else{
                    //  if the target square is enemy
                    if(!square.showMoveIcon) return;
                    resetLegalMoves();

                    let temp = [...squares]
                    temp[index].piece = temp[move.from].piece;
                    temp[index].image = temp[move.from].image;

                    temp[move.from].piece = Pieces.None;
                    temp[move.from].image = "none";

                    setSquares(temp)

                    setMove(prev => {
                        let temp = {...prev}
                        temp.turn = temp.turn === 16 ? 8 : 16;
                        temp.from = -1;
                        return temp;
                    })
                }
            }
        }
    }

    function resetLegalMoves(){
        let temp = [...squares]
        for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

        setSquares(temp);
    }

    function getLegalMoves(piece, index){
        let rank = Math.floor(index / 8), file = index % 8;
        let legalMoves = []

        if(Pieces.isPawn(piece)){
            console.log(piece, Pieces.Pawn, piece & Pieces.Pawn)
            // piece is a pawn
            console.log("pawn")
            
            if(Pieces.isWhite(piece)){
                console.log("White")
                // piece is white
                let nextSquare = (rank + 1) * 8 + file;
                if(squares[nextSquare].piece === Pieces.None) legalMoves.push(nextSquare);

                if(rank === 1){
                    nextSquare = (rank + 2) * 8 + file;
                    if(squares[nextSquare].piece === Pieces.None) legalMoves.push(nextSquare);
                }

                if(file > 0){
                    nextSquare = (rank + 1) * 8 + file - 1;
                    if(Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }

                if(file < 7){
                    nextSquare = (rank + 1) * 8 + file + 1;
                    if(Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }
            }else{
                // piece is black
                console.log("Black")
                let nextSquare = (rank - 1) * 8 + file;
                if(squares[nextSquare].piece === Pieces.None ||
                    Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);

                if(rank === 6){
                    nextSquare = (rank - 2) * 8 + file;
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }

                if(file > 0){
                    nextSquare = (rank - 1) * 8 + file - 1;
                    if(Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }

                if(file < 7){
                    nextSquare = (rank - 1) * 8 + file + 1;
                    if(Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }
            }
        }else if(Pieces.isKnight(piece)){
            console.log("Knight")
            // squares to move wrt current square
            const hor = [1, 2, 2, 1, -1, -2, -2, -1];
            const ver = [2, 1, -1, -2, -2, -1, 1, 2];
            let nextSquare = index, nextFile, nextRank;

            for(let i=0; i<8; i++){
                nextFile = file + hor[i];
                nextRank = rank + ver[i];

                if(nextFile < 0 || nextFile > 7 || nextRank < 0 || nextRank > 7) continue;

                nextSquare = nextRank * 8 + nextFile;

                if(Pieces.isWhite(piece)){
                    // for white knight
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }else{
                    // for black knight
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }
            }
        }else if(Pieces.isKing(piece)){
            console.log("King")
            const hor = [1, -1, 0, 0, 1, 1, -1, -1];
            const ver = [0, 0, 1, -1, 1, -1, 1, -1];

            let nextSquare = index, nextFile, nextRank;

            for(let i=0; i<8; i++){
                nextFile = file + hor[i];
                nextRank = rank + ver[i];

                if(nextFile < 0 || nextFile > 7 || nextRank < 0 || nextRank > 7) continue;

                nextSquare = nextRank * 8 + nextFile;

                if(Pieces.isWhite(piece)){
                    // for white king
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }else{
                    // for black king
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                }
            }
        }
        
        if(Pieces.isBishop(piece) || Pieces.isQueen(piece)){
            // for bishop and queen
            let nextSquare = index;

            // going topleft
            for(let r = rank + 1, f = file - 1; r < 8 && f > -1; r++, f--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }

            // going topright
            for(let r = rank + 1, f = file + 1; r < 8 && f < 8; r++, f++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }

            // going bottom left
            for(let r = rank - 1, f = file - 1; r > -1 && f > -1; r--, f--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }

            // going bottom right
            for(let r = rank - 1, f = file + 1; r > -1 && f < 8; r--, f++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }
        }
        
        if(Pieces.isRook(piece) || Pieces.isQueen(piece)){
            // for rook and queen

            let nextSquare = index;

            // going top
            for(let r = rank + 1, f = file; r < 8; r++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }

            // going bottom
            for(let r = rank - 1, f = file; r > -1; r--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }

            // going left
            for(let r = rank, f = file - 1; f > -1; f--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }

            // going right
            for(let r = rank, f = file + 1; f < 8 ; f++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(squares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(squares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(squares[nextSquare].piece)) legalMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(squares[nextSquare].piece)) break;
                }
            }
        }

        return legalMoves;
    }

    // function setBoard(placements){
    //     let temp = [...squares], file = 0, rank = 7;
    //     const pieces = placements.toString().split(' ')[0];
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
    // }


    return(
        <>
            <div className="boardConatiner">
                <div
                    className="ui"
                    onClick={() => {
                        resetBoard();
                    }}
                >
                    
                </div>
                <div className="board">
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
                                className="square"
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