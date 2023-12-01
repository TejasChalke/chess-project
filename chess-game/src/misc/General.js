import Pieces from "./Pieces";

export default class General{

    static testGeneration(depth, squares, boardState){
        if(depth === 0) return 1;

        const legalMoves = this.generateLegalMoves(JSON.parse(JSON.stringify(squares)), JSON.parse(JSON.stringify(boardState)));
        let ans = 0;

        for(let i=0; i<64; i++){

            for(let j=0; j<legalMoves[i].length; j++){
                let boardStateCopy = {...boardState};
                boardStateCopy.from = i;
                const res = this.makeMove(legalMoves[i][j], JSON.parse(JSON.stringify(boardStateCopy)), JSON.parse(JSON.stringify(squares)));
                ans = ans + this.testGeneration(depth - 1, res.nextSquareState, res.nextBoardState);
            }
        }

        return ans;
    }

    static isSquareAttacked(currPlayer, squares, indexToCheck){
        let attacked = false, rank = Math.floor(indexToCheck / 8), file = indexToCheck % 8, nextIndex;
        
        // check for pawns
        if(Pieces.isWhite(currPlayer)){
            // for white king
            if(rank < 5){
                nextIndex = (rank + 1) * 8 + file - 1;
                if(file > 0 && !Pieces.isSameColor(squares[nextIndex].piece, currPlayer) && Pieces.isPawn(squares[nextIndex].piece)){
                    attacked = true;
                }
                
                nextIndex = (rank + 1) * 8 + file + 1;
                if(file < 7 && !Pieces.isSameColor(squares[nextIndex].piece, currPlayer) && Pieces.isPawn(squares[nextIndex].piece)){
                    attacked = true;
                }
            }
            
            if(attacked) return true;
        }else{
            // for black king
            if(rank > 2){
                nextIndex = (rank - 1) * 8 + file - 1;
                if(file > 0 && !Pieces.isSameColor(squares[nextIndex].piece, currPlayer) && Pieces.isPawn(squares[nextIndex].piece)){
                    attacked = true;
                }

                nextIndex = (rank - 1) * 8 + file + 1;
                if(file < 7 && !Pieces.isSameColor(squares[nextIndex].piece, currPlayer) && Pieces.isPawn(squares[nextIndex].piece)){
                    attacked = true;
                }
            }

            if(attacked) return true;
        }
        
        
        // check for knights
        const hor = [1, 2, 2, 1, -1, -2, -2, -1];
        const ver = [2, 1, -1, -2, -2, -1, 1, 2];
        let nextFile = 0, nextRank = 0;
        
        for(let i=0; i<8; i++){
            nextFile = file + hor[i];
            nextRank = rank + ver[i];
            
            if(nextFile < 0 || nextFile > 7 || nextRank < 0 || nextRank > 7) continue;
            
            nextIndex = nextRank * 8 + nextFile;
            
            if(!Pieces.isSameColor(squares[nextIndex].piece, currPlayer) && Pieces.isKnight(squares[nextIndex].piece)){
                attacked = true;
                break;
            }
        }

        if(attacked) return true;
        
        // check for bishops and queen
        // going topleft
        for(let r = rank + 1, f = file - 1; r < 8 && f > -1; r++, f--){
            nextIndex = r * 8 + f;

            if(!Pieces.isNone(squares[nextIndex].piece)){
                // we encountered a piece
                // it is either of same color or it is of opposite color and not
                // a bishop or a queen
                if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                    break;
                }else{
                    if(Pieces.isBishop(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                        attacked = true;
                        break;
                    }else{
                        break;
                    }
                }
            }
        }

        if(attacked) return true;

        // going topright
        for(let r = rank + 1, f = file + 1; r < 8 && f < 8; r++, f++){
            nextIndex = r * 8 + f;

            if(!Pieces.isNone(squares[nextIndex].piece)){
                // we encountered a piece
                // it is either of same color or it is of opposite color and not
                // a bishop or a queen
                if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                    break;
                }else{
                    if(Pieces.isBishop(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                        attacked = true;
                        break;
                    }else{
                        break;
                    }
                }
            }
        }

        if(attacked) return true;

        // going bottom left
        for(let r = rank - 1, f = file - 1; r > -1 && f > -1; r--, f--){
            nextIndex = r * 8 + f;

            if(!Pieces.isNone(squares[nextIndex].piece)){
                // we encountered a piece
                // it is either of same color or it is of opposite color and not
                // a bishop or a queen
                if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                    break;
                }else{
                    if(Pieces.isBishop(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                        attacked = true;
                        break;
                    }else{
                        break;
                    }
                }
            }
        }

        if(attacked) return true;

        // going bottom right
        for(let r = rank - 1, f = file + 1; r > -1 && f < 8; r--, f++){
            nextIndex = r * 8 + f;

            if(!Pieces.isNone(squares[nextIndex].piece)){
                // we encountered a piece
                // it is either of same color or it is of opposite color and not
                // a bishop or a queen
                if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                    break;
                }else{
                    if(Pieces.isBishop(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                        attacked = true;
                        break;
                    }else{
                        break;
                    }
                }
            }
        }

        if(attacked) return true;
        
        // for rooks and queen
        // going top
        for(let r = rank + 1, f = file; r < 8; r++){
            nextIndex = r * 8 + f;
            
            if(Pieces.isNone(squares[nextIndex].piece)) continue;

            if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                break;
            }else{
                if(Pieces.isRook(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                    attacked = true;
                    break;
                }else{
                    break;
                }
            }
        }
        
        if(attacked) return true;
        
        // going bottom
        for(let r = rank - 1, f = file; r > -1; r--){
            nextIndex = r * 8 + f;
            
            if(Pieces.isNone(squares[nextIndex].piece)) continue;

            if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                break;
            }else{
                if(Pieces.isRook(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                    attacked = true;
                    break;
                }else{
                    break;
                }
            }
        }

        if(attacked) return true;

        // going left
        for(let r = rank, f = file - 1; f > -1; f--){
            nextIndex = r * 8 + f;

            if(Pieces.isNone(squares[nextIndex].piece)) continue;

            if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                break;
            }else{
                if(Pieces.isRook(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                    attacked = true;
                    break;
                }else{
                    break;
                }
            }
        }

        if(attacked) return true;

        // going right
        for(let r = rank, f = file + 1; f < 8 ; f++){
            nextIndex = r * 8 + f;

            if(Pieces.isNone(squares[nextIndex].piece)) continue;

            if(Pieces.isSameColor(squares[nextIndex].piece, currPlayer)){
                break;
            }else{
                if(Pieces.isRook(squares[nextIndex].piece) || Pieces.isQueen(squares[nextIndex].piece)){
                    attacked = true;
                    break;
                }else{
                    break;
                }
            }
        }

        if(attacked) return true;

        return false;
    }

    static generateLegalMoves(squares, boardState){
        let sudoLegalMoves = [];
        for(let i=0; i<64; i++){
            sudoLegalMoves.push(this.generateMoves(squares[i].piece, i, JSON.parse(JSON.stringify(boardState)), JSON.parse(JSON.stringify(squares))));
        }
        
        let tempLegalMoves = Array(64).fill([]);

        for(let i=0; i<64; i++){
            let holder = []
            for(let k=0; k<sudoLegalMoves[i].length; k++) {
                const move = sudoLegalMoves[i][k];

                let boardSquaresCopy = JSON.parse(JSON.stringify(squares)), boardStateCopy = JSON.parse(JSON.stringify(boardState));
                boardStateCopy.from = i;
                let res = this.makeMove(move, JSON.parse(JSON.stringify(boardStateCopy)), JSON.parse(JSON.stringify(boardSquaresCopy)));

                if(res !== undefined && res.nextBoardState !== undefined && res.nextSquareState !== undefined){
                    
                    var kingIndex = -1;
                    for(let j=0; j<64; j++){
                        if(Pieces.isKing(res.nextSquareState[j].piece)){
                            if((boardState.turn & res.nextSquareState[j].piece) !== 0){
                                kingIndex = j;
                                break;
                            }
                        }
                    }

                    let possibleMoves = []
                    for(let j=0; j<64; j++){
                        possibleMoves.push(this.generateMoves(res.nextSquareState[j].piece, j, JSON.parse(JSON.stringify(res.nextBoardState)), JSON.parse(JSON.stringify(res.nextSquareState))));
                    }
                    
                    var isLegalMove = true;
                    for(let j=0; j<64; j++){
                        for(let k=0; k<possibleMoves[j].length; k++){
                            if(possibleMoves[j][k] === kingIndex){
                                isLegalMove = false;
                                break;
                            }
                        }

                        if(!isLegalMove) break;
                    }

                    if(isLegalMove){
                        // console.log("legal move: " + i + ", " + move);
                        holder.push(move);
                    }
                }
            }

            tempLegalMoves[i] = holder;
        }

        return tempLegalMoves;
    }

    static generateMoves(piece, index, currBoardState, currSquares){
        if(!Pieces.isSameColor(piece, currBoardState.turn)) return [];

        let rank = Math.floor(index / 8), file = index % 8;
        let currentMoves = []

        if(Pieces.isPawn(piece)){
            // piece is a pawn
            
            if(Pieces.isWhite(piece)){
                // piece is white
                let nextSquare = (rank + 1) * 8 + file;

                if(currSquares[nextSquare].piece === Pieces.None){
                    currentMoves.push(nextSquare);

                    if(rank === 1){
                        nextSquare = (rank + 2) * 8 + file;
                        if(currSquares[nextSquare].piece === Pieces.None) currentMoves.push(nextSquare);
                    }
                }


                if(file > 0){
                    nextSquare = (rank + 1) * 8 + file - 1;
                    if(Pieces.isBlack(currSquares[nextSquare].piece) ||
                    (nextSquare === currBoardState.enPassant && (rank + 1 === 5))) currentMoves.push(nextSquare);
                }

                if(file < 7){
                    nextSquare = (rank + 1) * 8 + file + 1;
                    if(Pieces.isBlack(currSquares[nextSquare].piece) ||
                    (nextSquare === currBoardState.enPassant && (rank + 1 === 5))) currentMoves.push(nextSquare);
                }
            }else{
                // piece is black
                let nextSquare = (rank - 1) * 8 + file;
                
                if(currSquares[nextSquare].piece === Pieces.None){
                    currentMoves.push(nextSquare);
                    
                    if(rank === 6){
                        nextSquare = (rank - 2) * 8 + file;
                        if(currSquares[nextSquare].piece === Pieces.None) currentMoves.push(nextSquare);
                    }
                }

                if(file > 0){
                    nextSquare = (rank - 1) * 8 + file - 1;
                    if(Pieces.isWhite(currSquares[nextSquare].piece) ||
                    (nextSquare === currBoardState.enPassant && (rank - 1 === 2))) currentMoves.push(nextSquare);
                }

                if(file < 7){
                    nextSquare = (rank - 1) * 8 + file + 1;
                    if(Pieces.isWhite(currSquares[nextSquare].piece) ||
                    (nextSquare === currBoardState.enPassant && (rank - 1 === 2))) currentMoves.push(nextSquare);
                }
            }
        }else if(Pieces.isKnight(piece)){
            // currSquares to move wrt current square
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
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                }else{
                    // for black knight
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                }
            }
        }else if(Pieces.isKing(piece)){
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
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                }else{
                    // for black king
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                }
            }

            let clear = true;
            for(let i=file+1; i < 7; i++){
                nextSquare = rank * 8 + i;
                if(!Pieces.isNone(currSquares[nextSquare].piece)){
                    clear = false;
                    break;
                }
            }
            if(clear){
                if(Pieces.isWhite(piece) && currBoardState.castling.indexOf('K') !== -1 && rank === 0){
                    if(!this.isSquareAttacked(currBoardState.turn, currSquares, file + 1) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, file) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, file + 2)) currentMoves.push(rank * 8 + file + 2);
                    else console.log("safe");
                }
                if(Pieces.isBlack(piece) && currBoardState.castling.indexOf('k') !== -1 && rank === 7){
                    if(!this.isSquareAttacked(currBoardState.turn, currSquares, 7 * 8 + file + 1) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, 7 * 8 + file &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, 7 * 8 + file + 2))) currentMoves.push(rank * 8 + file + 2);
                }
                
            }
            
            clear = true;
            for(let i=file-1; i > 0; i--){
                nextSquare = rank * 8 + i;
                if(!Pieces.isNone(currSquares[nextSquare].piece)){
                    clear = false;
                    break;
                }
            }
            if(clear){
                if(Pieces.isWhite(piece) && currBoardState.castling.indexOf('Q') !== -1 && rank === 0){
                    if(!this.isSquareAttacked(currBoardState.turn, currSquares, file - 1) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, file) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, file - 2)) currentMoves.push(rank * 8 + file + 2);
                    else console.log("safe");
                }
                if(Pieces.isBlack(piece) && currBoardState.castling.indexOf('q') !== -1 && rank === 7){
                    if(!this.isSquareAttacked(currBoardState.turn, currSquares, 7 * 8 + file - 1) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, 7 * 8 + file) &&
                    !this.isSquareAttacked(currBoardState.turn, currSquares, 7 * 8 + file - 2)) currentMoves.push(rank * 8 + file - 2);
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
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }

            // going topright
            for(let r = rank + 1, f = file + 1; r < 8 && f < 8; r++, f++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }

            // going bottom left
            for(let r = rank - 1, f = file - 1; r > -1 && f > -1; r--, f--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }

            // going bottom right
            for(let r = rank - 1, f = file + 1; r > -1 && f < 8; r--, f++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black bishop
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
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
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }

            // going bottom
            for(let r = rank - 1, f = file; r > -1; r--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }

            // going left
            for(let r = rank, f = file - 1; f > -1; f--){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }

            // going right
            for(let r = rank, f = file + 1; f < 8 ; f++){
                nextSquare = r * 8 + f;

                if(Pieces.isWhite(piece)){
                    // for white rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isBlack(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isBlack(currSquares[nextSquare].piece)) break;
                }else{
                    // for black rook
                    if(currSquares[nextSquare].piece === Pieces.None ||
                        Pieces.isWhite(currSquares[nextSquare].piece)) currentMoves.push(nextSquare);
                    else break;

                    if(Pieces.isWhite(currSquares[nextSquare].piece)) break;
                }
            }
        }

        return currentMoves;
    }

    static makeMove(to, currBoardState, currSquares){

        if(currBoardState.from === -1) return undefined;
        
        if(currSquares[to].piece === Pieces.None){
            let temp = JSON.parse(JSON.stringify(currSquares));
            let nextBoardState = {...currBoardState};

            if(Pieces.isKing(temp[currBoardState.from].piece)){

                if(Pieces.isWhite(temp[currBoardState.from].piece)
                    && Math.floor(to/8) === 0 && currBoardState.from % 8 === 4 &&
                    to % 8 === 6 && currBoardState.castling.indexOf('K') !== -1){
                    // white castling king side

                    temp[to].piece = Pieces.charToNumber.get('K');
                    temp[to - 1].piece = Pieces.charToNumber.get('R');
                    temp[7].piece = Pieces.None;
                    temp[currBoardState.from].piece = Pieces.None;

                    temp[to].image = Pieces.charToImage.get('K');
                    temp[to - 1].image = Pieces.charToImage.get('R');
                    temp[7].image = "none";
                    temp[currBoardState.from].image = "none";
                }
                else if(Pieces.isWhite(temp[currBoardState.from].piece)
                    && Math.floor(to/8) === 0 && currBoardState.from % 8 === 4 &&
                    to % 8 === 2 && currBoardState.castling.indexOf('Q') !== -1){
                    // white castling queen side

                    temp[to].piece = Pieces.charToNumber.get('K');
                    temp[to + 1].piece = Pieces.charToNumber.get('R');
                    temp[0].piece = Pieces.None;
                    temp[currBoardState.from].piece = Pieces.None;

                    temp[to].image = Pieces.charToImage.get('K');
                    temp[to + 1].image = Pieces.charToImage.get('R');
                    temp[0].image = "none";
                    temp[currBoardState.from].image = "none";
                }
                else if(Pieces.isBlack(temp[currBoardState.from].piece)
                    && Math.floor(to/8) === 7 && currBoardState.from % 8 === 4 &&
                    to % 8 === 6 && currBoardState.castling.indexOf('k') !== -1){
                    // black castling king side

                    temp[to].piece = Pieces.charToNumber.get('k');
                    temp[to - 1].piece = Pieces.charToNumber.get('r');
                    temp[8 * 7 + 7].piece = Pieces.None;
                    temp[currBoardState.from].piece = Pieces.None;

                    temp[to].image = Pieces.charToImage.get('k');
                    temp[to - 1].image = Pieces.charToImage.get('r');
                    temp[8 * 7 + 7].image = "none";
                    temp[currBoardState.from].image = "none";
                }
                else if(Pieces.isBlack(temp[currBoardState.from].piece)
                    && Math.floor(to/8) === 7 && currBoardState.from % 8 === 4 &&
                    to % 8 === 2 && currBoardState.castling.indexOf('q') !== -1){
                    // black castling queen side

                    temp[to].piece = Pieces.charToNumber.get('k');
                    temp[to + 1].piece = Pieces.charToNumber.get('r');
                    temp[8 * 7].piece = Pieces.None;
                    temp[currBoardState.from].piece = Pieces.None;

                    temp[to].image = Pieces.charToImage.get('k');
                    temp[to + 1].image = Pieces.charToImage.get('r');
                    temp[8 * 7].image = "none";
                    temp[currBoardState.from].image = "none";
                }
                else{
                    // simply moved
                    temp[to].piece = temp[currBoardState.from].piece;
                    temp[to].image = temp[currBoardState.from].image;
                    
                    temp[currBoardState.from].piece = Pieces.None;
                    temp[currBoardState.from].image = "none";
                }

                if(Pieces.isWhite(temp[to].piece)){
                    // for white king
                    let newCastle = "";
                    if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                    if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                    nextBoardState.castling = newCastle;
                }else{
                    // for black king
                    let newCastle = "";
                    if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                    if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';

                    nextBoardState.castling = newCastle;
                }

                nextBoardState.enPassant = -1;

            } else if(Pieces.isPawn(temp[currBoardState.from].piece)){
                // if capturing by en passant
                if(to === currBoardState.enPassant){
                    if(Pieces.isWhite(temp[currBoardState.from].piece)){
                        temp[to - 8].piece = Pieces.None;
                        temp[to - 8].image = "none";
                    }else{
                        temp[to + 8].piece = Pieces.None;
                        temp[to + 8].image = "none";
                    }
                    
                } else {
                    if(Math.floor(to/8) === 0){
                        temp[to].piece = Pieces.charToNumber.get(currBoardState.promoteTo);
                        temp[to].image = Pieces.charToImage.get(currBoardState.promoteTo);
                    }else if(Math.floor(to/8) === 7){
                        temp[to].piece = Pieces.charToNumber.get(currBoardState.promoteTo);
                        temp[to].image = Pieces.charToImage.get(currBoardState.promoteTo);
                    }else{
                        temp[to].piece = temp[currBoardState.from].piece;
                        temp[to].image = temp[currBoardState.from].image;
                    }
                    
                }

                temp[currBoardState.from].piece = Pieces.None;
                temp[currBoardState.from].image = "none";
                
                // change en passant square
                if(Math.abs(to - currBoardState.from) === 16)
                    nextBoardState.enPassant = Pieces.isWhite(temp[to].piece) ? to - 8 : to + 8;
                else nextBoardState.enPassant = -1;

            } else {
            
                temp[to].piece = temp[currBoardState.from].piece;
                temp[to].image = temp[currBoardState.from].image;
                
                temp[currBoardState.from].piece = Pieces.None;
                temp[currBoardState.from].image = "none";

                nextBoardState.enPassant = -1;
            }
            
            // changing castling rights
            if(Pieces.isRook(temp[to].piece)){
                if(Pieces.isWhite(temp[to].piece)){
                    if(currBoardState.from === 0 && currBoardState.castling.indexOf('Q') !== -1){
                        let newCastle = "";
                        if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                        if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                        if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                        nextBoardState.castling = newCastle;
                    }else if(currBoardState.from === 7 && currBoardState.castling.indexOf('K') !== -1){
                        let newCastle = "";
                        if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                        if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                        if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                        nextBoardState.castling = newCastle;
                    }
                }else{
                    if(currBoardState.from === 8 * 7 && currBoardState.castling.indexOf('q') !== -1){
                        let newCastle = "";
                        if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                        if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                        if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';

                        nextBoardState.castling = newCastle;
                    }else if(currBoardState.from === 8 * 7 + 7 && currBoardState.castling.indexOf('k') !== -1){
                        let newCastle = "";
                        if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                        if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                        if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';

                        nextBoardState.castling = newCastle;
                    }
                }
            }

            nextBoardState.turn = currBoardState.turn === Pieces.Black ? Pieces.White : Pieces.Black;
            nextBoardState.from = -1;
            for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

            return {
                nextBoardState: nextBoardState,
                nextSquareState: temp
            }
        }else{
            //  if the target square is enemy
            let temp = [...currSquares]
            let nextBoardState = {...currBoardState};
            nextBoardState.turn = currBoardState.turn === Pieces.Black ? Pieces.White : Pieces.Black;
            nextBoardState.from = -1;
            nextBoardState.enPassant = -1;

            if(Pieces.isRook(temp[to].piece)){
                let newCastle = "";
                if(Pieces.isWhite(temp[to].piece)){
                    if(to === 0){
                        // queen side white rook captured
                        
                        if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                        if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';
                        if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                    }else{
                        // king side white rook captured
                        
                        if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                        if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';
                        if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                    }
                }else{
                    if(to === 56){
                        // queen side black rook captured
                        
                        if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                        if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                        if(nextBoardState.castling.indexOf('k') !== -1) newCastle += 'k';
                        
                    }else{
                        // king side black rook captured

                        if(nextBoardState.castling.indexOf('Q') !== -1) newCastle += 'Q';
                        if(nextBoardState.castling.indexOf('K') !== -1) newCastle += 'K';
                        if(nextBoardState.castling.indexOf('q') !== -1) newCastle += 'q';
                    }
                }

                nextBoardState.castling = newCastle;
            }

            if(Pieces.isPawn(temp[currBoardState.from].piece)){
                if(Math.floor(to/8) === 0){
                    temp[to].piece = Pieces.charToNumber.get(currBoardState.promoteTo);
                    temp[to].image = Pieces.charToImage.get(currBoardState.promoteTo);
                }else if(Math.floor(to/8) === 7){
                    temp[to].piece = Pieces.charToNumber.get(currBoardState.promoteTo);
                    temp[to].image = Pieces.charToImage.get(currBoardState.promoteTo);
                }else{
                    temp[to].piece = temp[currBoardState.from].piece;
                    temp[to].image = temp[currBoardState.from].image;
                }
            }else{
                temp[to].piece = temp[currBoardState.from].piece;
                temp[to].image = temp[currBoardState.from].image;
            }

            temp[currBoardState.from].piece = Pieces.None;
            temp[currBoardState.from].image = "none";

            for(let i=0; i<64; i++) temp[i].showMoveIcon = false;

            return {
                nextBoardState: nextBoardState,
                nextSquareState: temp
            }
        }
    }
}