function movePiece(index, square){
    console.log(boardState, Math.floor(index/8) + ", " + index%8 + " : " + square.piece);
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
        
        const legalMoves = General.generateMoves(square.piece, index, boardState, squares);
        let temp = [...squares]
        for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

        legalMoves.forEach(val => {
            temp[val].showMoveIcon = true;
        })

        setSquares(temp);
        
    }else{
        if((square.piece !== Pieces.None) && Pieces.isSameColor(square.piece, boardState.turn)){
            // if selecting pieces of same color
            setBoardState(prev => {
                prev.from = index;
                return prev;
            })

            const legalMoves = General.generateMoves(square.piece, index, boardState, squares);
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
                resetLegalMoveIcon();

                let temp = [...squares]

                if(Pieces.isKing(temp[boardState.from].piece) && Math.abs(index - boardState.from) > 1){
                    if(Pieces.isWhite(temp[boardState.from].piece)){
                        if(boardState.from - index > 1){
                            // white castling queen side

                            temp[index].piece = Pieces.charToNumber.get('K');
                            temp[index + 1].piece = Pieces.charToNumber.get('R');
                            temp[0].piece = Pieces.None;
                            temp[boardState.from].piece = Pieces.None;

                            temp[index].image = Pieces.charToImage.get('K');
                            temp[index + 1].image = Pieces.charToImage.get('R');
                            temp[0].image = "none";
                            temp[boardState.from].image = "none";
                        }else if(index - boardState.from > 1){
                            // white castling king side

                            temp[index].piece = Pieces.charToNumber.get('K');
                            temp[index - 1].piece = Pieces.charToNumber.get('R');
                            temp[7].piece = Pieces.None;
                            temp[boardState.from].piece = Pieces.None;

                            temp[index].image = Pieces.charToImage.get('K');
                            temp[index - 1].image = Pieces.charToImage.get('R');
                            temp[7].image = "none";
                            temp[boardState.from].image = "none";
                        }
                    }else{
                        if(boardState.from - index > 1){
                            // black castling queen side

                            temp[index].piece = Pieces.charToNumber.get('k');
                            temp[index + 1].piece = Pieces.charToNumber.get('r');
                            temp[8 * 7].piece = Pieces.None;
                            temp[boardState.from].piece = Pieces.None;

                            temp[index].image = Pieces.charToImage.get('k');
                            temp[index + 1].image = Pieces.charToImage.get('r');
                            temp[8 * 7].image = "none";
                            temp[boardState.from].image = "none";
                        }else if(index - boardState.from > 1){
                            // black castling king side

                            temp[index].piece = Pieces.charToNumber.get('k');
                            temp[index - 1].piece = Pieces.charToNumber.get('r');
                            temp[8 * 7 + 7].piece = Pieces.None;
                            temp[boardState.from].piece = Pieces.None;

                            temp[index].image = Pieces.charToImage.get('k');
                            temp[index - 1].image = Pieces.charToImage.get('r');
                            temp[8 * 7 + 7].image = "none";
                            temp[boardState.from].image = "none";
                        }
                    }
                } else{
                    // if capturing by en passant
                    if(Pieces.isPawn(temp[boardState.from].piece) && index === boardState.enPassant){
                        if(Pieces.isWhite(temp[boardState.from].piece)){
                            temp[index - 8].piece = Pieces.None;
                            temp[index - 8].image = "none";
                        }else{
                            temp[index + 8].piece = Pieces.None;
                            temp[index + 8].image = "none";
                        }
                    }

                    temp[index].piece = temp[boardState.from].piece;
                    temp[index].image = temp[boardState.from].image;
                    
                    temp[boardState.from].piece = Pieces.None;
                    temp[boardState.from].image = "none";
                }
                
                
                setSquares(temp);
                
                let nextBoardState = {...boardState};
                if(Pieces.isPawn(temp[index].piece)){
                    if(Math.abs(index - boardState.from) === 16) nextBoardState.enPassant = Pieces.isWhite(temp[index].piece) ? index - 8 : index + 8;
                    else nextBoardState.enPassant = -1;
                }
                
                // changing castling rights
                if(Pieces.isRook(temp[index].piece)){
                    if(Pieces.isWhite(temp[index].piece)){
                        if(boardState.from === 0 && boardState.castling.indexOf('Q') !== -1){
                            let newCastle = "";
                            if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                            if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                            if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                            nextBoardState.castling = newCastle;
                        }else if(boardState.from === 7 && boardState.castling.indexOf('K') !== -1){
                            let newCastle = "";
                            if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                            if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                            if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                            nextBoardState.castling = newCastle;
                        }
                    }else{
                        if(boardState.from === 8 * 7 && boardState.castling.indexOf('q') !== -1){
                            let newCastle = "";
                            if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                            if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                            if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';

                            nextBoardState.castling = newCastle;
                        }else if(boardState.from === 8 * 7 + 7 && boardState.castling.indexOf('k') !== -1){
                            let newCastle = "";
                            if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                            if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                            if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                            nextBoardState.castling = newCastle;
                        }
                    }
                }

                nextBoardState.turn = boardState.turn === 16 ? 8 : 16;
                nextBoardState.from = -1;
                setBoardState(nextBoardState);

            }else{
                //  if the target square is enemy
                if(!square.showMoveIcon) return;
                resetLegalMoveIcon();

                let temp = [...squares]
                temp[index].piece = temp[boardState.from].piece;
                temp[index].image = temp[boardState.from].image;

                temp[boardState.from].piece = Pieces.None;
                temp[boardState.from].image = "none";

                setSquares(temp)

                setBoardState(prev => {
                    let temp = {...prev}
                    temp.turn = temp.turn === 16 ? 8 : 16;
                    temp.from = -1;
                    return temp;
                })
            }
        }
    }
}