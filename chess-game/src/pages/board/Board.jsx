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
                text: (rank + 1).toString()
            })
        }

        setSquares(temp);
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
                file++;
            }else if(numbers.indexOf(curr) !== -1){
                file += parseInt(curr);
            }else{
                rank--;
                file = 0;
            }
        });
    
        setSquares(temp);
    }

    function movePiece(index, square){
        console.log(move, Math.floor(index/8) + ", " + index%8 + " : " + square.piece);
        // cannot move opponents pieces
        if(square.piece !== Pieces.None && (!Pieces.isSameColor(square.piece, move.turn) && move.from === -1)) return;

        if(move.from === -1){
            // not selected a piece

            // square is empty
            if(square.piece === Pieces.None) return;

            setMove(prev => {
                prev.from = index;
                return prev;
            })
        }else{
            if((square.piece !== Pieces.None) && Pieces.isSameColor(square.piece, move.turn)){
                // if selecting pieces of same color
                setMove(prev => {
                    prev.from = index;
                    return prev;
                })
            }else{
                if(square.piece === Pieces.None){
                    // if the target square is empty
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
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}