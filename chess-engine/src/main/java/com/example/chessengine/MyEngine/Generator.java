package com.example.chessengine.MyEngine;

import java.util.ArrayList;
import java.util.List;

public class Generator {
    List<Move> moves;
    Board board;
    long attackMask, attackMaskNoPawns, slidingAttackMask, knightAttackMask, pawnAttackMask, checkRayMask, pinRayMask;
    boolean inCheck, inDoubleCheck, isPinned;
    int currentColorIndex, opponentColorIndex, kingSquare;

    public List<Move> GenerateMoves(Board board){
        moves = new ArrayList<>();
        this.board = board;
        currentColorIndex = board.colorToMoveIndex;
        kingSquare = board.kingIndex[currentColorIndex];

        GenerateAttackMask();
        GenerateKingMoves();

        if(inDoubleCheck) return moves;

        GenerateSlidingMoves();
        GenerateKnightMoves();
        GeneratePawnMoves();
        // for(Move m: moves) System.out.println(m.from + "->" + m.to);

        // BoardUtility.displayPosition(board.squares, attackMask);
        // BoardUtility.displayPosition(board.squares, checkRayMask);

        return moves;
    }
    
    void GenerateKingMoves(){
        boolean canCastle;
        // generate general legal moves for king
        for(int targetSquare : PrecomputedData.kingAttackSquares[kingSquare]) {

            if(Pieces.isSameColor(board.colorToMove, board.squares[targetSquare]) || isSquareAttacked(targetSquare)) continue;

            moves.add(new Move(kingSquare, targetSquare));
        }

        // white castling moves
        if(!inCheck && kingSquare == BoardUtility.e1 && Pieces.isWhite(board.squares[kingSquare])){
            canCastle = (board.currentBoardState & 1) != 0;

            if(canCastle && Pieces.isNone(board.squares[BoardUtility.f1]) && Pieces.isNone(board.squares[BoardUtility.g1])){
                if(!isSquareAttacked(BoardUtility.f1) && !isSquareAttacked(BoardUtility.g1)){
                    moves.add(new Move(kingSquare, BoardUtility.g1, Move.Flag.CASTLE_KING_SIDE));
                }
            }

            canCastle = (board.currentBoardState & 2) != 0;

            if(canCastle && Pieces.isNone(board.squares[BoardUtility.d1]) && Pieces.isNone(board.squares[BoardUtility.c1])){
                if(!isSquareAttacked(BoardUtility.d1) && !isSquareAttacked(BoardUtility.c1)){
                    moves.add(new Move(kingSquare, BoardUtility.c1, Move.Flag.CASTLE_QUEEN_SIDE));
                }
            }
        }

        // black castling moves
        if(!inCheck && kingSquare == BoardUtility.e8 && !Pieces.isWhite(board.squares[kingSquare])){
            canCastle = (board.currentBoardState & 3) != 0;

            if(canCastle && Pieces.isNone(board.squares[BoardUtility.f8]) && Pieces.isNone(board.squares[BoardUtility.g8])){
                if(!isSquareAttacked(BoardUtility.f8) && !isSquareAttacked(BoardUtility.g8)){
                    moves.add(new Move(kingSquare, BoardUtility.g8, Move.Flag.CASTLE_KING_SIDE));
                }
            }

            canCastle = (board.currentBoardState & 4) != 0;

            if(canCastle && Pieces.isNone(board.squares[BoardUtility.d8]) && Pieces.isNone(board.squares[BoardUtility.c8])){
                if(!isSquareAttacked(BoardUtility.d8) && !isSquareAttacked(BoardUtility.c8)){
                    moves.add(new Move(kingSquare, BoardUtility.c8, Move.Flag.CASTLE_QUEEN_SIDE));
                }
            }
        }
    }

    void GenerateSlidingMoves(){
        PieceList queens = board.queens[currentColorIndex];
        for(int i=0; i<queens.count; i++){
            GenerateSlidingPieceMoves(queens.occupiedSquares[i], 0, 8);
        }

        PieceList bishops = board.bishops[currentColorIndex];
        for(int i=0; i<bishops.count; i++){
            GenerateSlidingPieceMoves(bishops.occupiedSquares[i], 4, 8);
        }

        PieceList rooks = board.rooks[currentColorIndex];
        for(int i=0; i<rooks.count; i++){
            GenerateSlidingPieceMoves(rooks.occupiedSquares[i], 0, 4);
        }
    }

    void GenerateSlidingPieceMoves(int startSquare, int startIndex, int endIndex){
        if(isPinned(startSquare)){
            if(inCheck) return;

            for (int directionIndex = startIndex; directionIndex < endIndex; directionIndex++) {
                int currentDirOffset = PrecomputedData.moveDirOffset[directionIndex];

                // can only move in pinned direction
                if(!isMovingAlongRay(currentDirOffset, kingSquare, startSquare)) continue;

                for (int n = 0; n < PrecomputedData.distanceToEdge[startSquare][directionIndex]; n++) {
                    int targetSquare = startSquare + currentDirOffset * (n + 1);

                    moves.add(new Move(startSquare, targetSquare));

                    // a piece(pinning piece) is encountered
                    // stop generating
                    if(!Pieces.isNone(board.squares[targetSquare])) break;
                }
            }
        }else {
            // piece is not pinned and can move
            for (int directionIndex = startIndex; directionIndex < endIndex; directionIndex++) {
                int currentDirOffset = PrecomputedData.moveDirOffset[directionIndex];
                boolean isCapture = false;

                for (int n = 0; n < PrecomputedData.distanceToEdge[startSquare][directionIndex]; n++) {
                    int targetSquare = startSquare + currentDirOffset * (n + 1);
                    // if we encounter same color piece then we stop
                    if (!Pieces.isNone(board.squares[targetSquare])) {
                        if (Pieces.isSameColor(board.colorToMove, board.squares[targetSquare])) break;
                        else isCapture = true;
                    }

                    // if the king is not in check or
                    // the current move will block the check
                    if (!inCheck || isIntersectingCheck(targetSquare)) {
                        moves.add(new Move(startSquare, targetSquare));
                    }

                    // captured a piece
                    if(isCapture) break;
                }
            }
        }
    }

    void GenerateKnightMoves(){
        PieceList knights = board.knights[currentColorIndex];

        for(int i=0; i<knights.count; i++){
            int startSquare = knights.occupiedSquares[i];
            if(isPinned(startSquare)) continue;

            for(int targetSquare: PrecomputedData.knightAttackSquares[startSquare]){
                if(Pieces.isSameColor(board.colorToMove, board.squares[targetSquare])) continue;
                if(inCheck && !isIntersectingCheck(targetSquare)) continue;

                moves.add(new Move(startSquare, targetSquare));
            }
        }
    }

    void GeneratePawnMoves(){
        PieceList pawns = board.pawns[currentColorIndex];

        for(int i=0; i<pawns.count; i++){
            int startSquare = pawns.occupiedSquares[i], targetSquare;
            int rank = startSquare / 8, file = startSquare % 8;
            boolean whiteToMove = board.whiteToMove, pawnPinned = isPinned(startSquare);
            int moveDir = whiteToMove ? 8 : -8;
            int epSquareFile = (int)((board.currentBoardState >> 4) & 15) - 1;
            int epSquare = -1;

            if(epSquareFile != -1) {
                epSquare = (whiteToMove ? 40 : 16) + epSquareFile;
            }
            System.out.println(epSquareFile + ", " + epSquare);

            // cannot move this pawn
            if(pawnPinned && inCheck) continue;

            if(!pawnPinned || isMovingAlongRay(moveDir, kingSquare, startSquare)){
                targetSquare = startSquare + moveDir;

                if(Pieces.isNone(board.squares[targetSquare])){

                    if(!inCheck || isIntersectingCheck(targetSquare)) {
                        // pawn made it to last file
                        if ((whiteToMove && rank == 6) || (!whiteToMove && rank == 1))
                            GeneratePromotionMoves(startSquare, targetSquare);
                        else moves.add(new Move(startSquare, targetSquare));
                    }

                    // moving 2 squares ahead
                    if((whiteToMove && rank == 1) || (!whiteToMove && rank == 6)){
                        targetSquare += moveDir;

                        if(!inCheck || isIntersectingCheck(targetSquare)){
                            if(Pieces.isNone(board.squares[targetSquare]))
                                moves.add(new Move(startSquare, targetSquare, Move.Flag.PAWN_TWO_SQUARES_FORWARD));
                        }
                    }
                }
            }

            // normal and en passant captures
            moveDir = whiteToMove ? 9 : -9;
            if(!pawnPinned || isMovingAlongRay(moveDir, kingSquare, startSquare)){
                targetSquare = startSquare + moveDir;

                if(!Pieces.isNone(board.squares[targetSquare]) && !Pieces.isSameColor(board.colorToMove, board.squares[targetSquare])){
                    moves.add(new Move(startSquare, targetSquare));

                    // pawn took a piece on last file
                    if((whiteToMove && rank == 6) || (!whiteToMove && rank == 1)) GeneratePromotionMoves(startSquare, targetSquare);
                }

                if(Pieces.isNone(board.squares[targetSquare]) && targetSquare == epSquare){
                    if(!inCheckAfterEnPassant(startSquare, targetSquare)) moves.add(new Move(startSquare, targetSquare, Move.Flag.EN_PASSANT));
                }
            }

            // normal and en passant captures
            moveDir = whiteToMove ? 7 : -7;
            if(!pawnPinned || isMovingAlongRay(moveDir, kingSquare, startSquare)){
                targetSquare = startSquare + moveDir;

                if(!Pieces.isNone(board.squares[targetSquare]) && !Pieces.isSameColor(board.colorToMove, board.squares[targetSquare])){
                    moves.add(new Move(startSquare, targetSquare));

                    // pawn took a piece on last file
                    if((whiteToMove && rank == 6) || (!whiteToMove && rank == 1)) GeneratePromotionMoves(startSquare, targetSquare);
                }

                if(Pieces.isNone(board.squares[targetSquare]) && targetSquare == epSquare){
                    if(!inCheckAfterEnPassant(startSquare, targetSquare)) moves.add(new Move(startSquare, targetSquare, Move.Flag.EN_PASSANT));
                }
            }
        }
    }

    boolean inCheckAfterEnPassant(int from, int to){
        boolean whiteToMove = board.whiteToMove, isChecked = false;
        board.squares[to] = Pieces.Pawn | (whiteToMove ? Pieces.White : Pieces.Black);
        board.squares[from] = Pieces.None;
        int enemyPawnIndex = to + (whiteToMove ? -8 : 8);
        board.squares[enemyPawnIndex] = Pieces.None;

        int direction = (from % 8) < (to % 8) ? 3 : 2;

        for(int n = 0; n < PrecomputedData.distanceToEdge[kingSquare][direction]; n++){
            int targetSquare = kingSquare + (n + 1) * PrecomputedData.moveDirOffset[direction];
            int currPiece = board.squares[targetSquare];

            if(!Pieces.isNone(currPiece)){
                // found a friendly piece
                if(Pieces.isSameColor(board.colorToMove, currPiece)) break;

                // only pinned if it is a rook or queen
                if(Pieces.isRookOrQueen(currPiece)){
                    isChecked = true;
                }
                else break;
            }
        }

        int enemyPawn = Pieces.Pawn | (whiteToMove ? Pieces.Black : Pieces.White);
        if(whiteToMove){
            if(PrecomputedData.distanceToEdge[kingSquare][4] > 0){
                int targetSquare = kingSquare + 7;
                if(board.squares[targetSquare] == enemyPawn) isChecked = true;
            }

            if(PrecomputedData.distanceToEdge[kingSquare][6] > 0){
                int targetSquare = kingSquare + 9;
                if(board.squares[targetSquare] == enemyPawn) isChecked = true;
            }
        }else{
            if(PrecomputedData.distanceToEdge[kingSquare][5] > 0){
                int targetSquare = kingSquare - 7;
                if(board.squares[targetSquare] == enemyPawn) isChecked = true;
            }

            if(PrecomputedData.distanceToEdge[kingSquare][7] > 0){
                int targetSquare = kingSquare - 9;
                if(board.squares[targetSquare] == enemyPawn) isChecked = true;
            }
        }

        board.squares[from] = Pieces.Pawn | (whiteToMove ? Pieces.White : Pieces.Black);
        board.squares[to] = Pieces.None;
        board.squares[enemyPawnIndex] = enemyPawn;

        return isChecked;
    }

    void GeneratePromotionMoves(int from, int to){
        moves.add(new Move(from, to, Move.Flag.PROMOTE_TO_QUEEN));
        moves.add(new Move(from, to, Move.Flag.PROMOTE_TO_ROOK));
        moves.add(new Move(from, to, Move.Flag.PROMOTE_TO_KNIGHT));
        moves.add(new Move(from, to, Move.Flag.PROMOTE_TO_BISHOP));
    }

    boolean isSquareAttacked(int square){
        return BoardUtility.overlapingSquares(attackMask, square);
    }

    boolean isPinned(int square){
        return ((pinRayMask >> square) & 1) != 0;
    }

    boolean isIntersectingCheck(int square){
        return ((checkRayMask >> square) & 1) != 0;
    }

    // I do not understand this
    boolean isMovingAlongRay (int rayDir, int startSquare, int targetSquare) {
        int moveDir = PrecomputedData.directionalLookup[targetSquare - startSquare + 63];
        return (rayDir == moveDir || -rayDir == moveDir);
    }

    void GenerateAttackMask(){
        attackMask = attackMaskNoPawns = 0;
        slidingAttackMask = 0;
        knightAttackMask = 0;
        pawnAttackMask = 0;
        checkRayMask = pinRayMask = 0;
        inCheck = inDoubleCheck = isPinned = false;
        opponentColorIndex = 1 - currentColorIndex;

        // generate attack mask for sliding pieces
        // as it is not pre-computed
        GenerateSlidingAttackMask();

        int targetSquare, currOffset, startSquare;

        // check for checks, pins and double checks
        // by sliding pieces
        for(int dirIndex = 0; dirIndex < 8; dirIndex++){
            currOffset = PrecomputedData.moveDirOffset[dirIndex];
            boolean isFriendlyPieceBlocking = false;
            boolean isDiagonal = dirIndex > 3;
            long rayMask = 0;

            for(int i=0; i<PrecomputedData.distanceToEdge[kingSquare][dirIndex]; i++){
                targetSquare = kingSquare + (i + 1) * currOffset;
                rayMask |= 1L << targetSquare;

                if(Pieces.isNone(board.squares[targetSquare])) continue;

                int currPiece = board.squares[targetSquare];
                if(Pieces.isSameColor(board.colorToMove, currPiece)){
                    if(!isFriendlyPieceBlocking){
                        // first friendly piece encountered
                        isFriendlyPieceBlocking = true;
                    }else{
                        // there are 2 friendly pieces no pins possible
                        // in this direction
                        break;
                    }
                }else{
                    if((isDiagonal && Pieces.isBishopOrQueen(currPiece)) || (!isDiagonal && Pieces.isRookOrQueen(currPiece))){
                        if(isFriendlyPieceBlocking){
                            // found a piece that is pinned
                            isPinned = true;
                            pinRayMask |= rayMask;
                            break;
                        } else {
                            // if no piece is blocking then it is a check
                            inDoubleCheck = inCheck;
                            inCheck = true;
                            checkRayMask |= rayMask;
                            break;
                        }
                    } else {
                        // no pinning piece was found
                        break;
                    }
                }
            }

            // only king can move
            if(inDoubleCheck) break;
        }

        // attack and check mask for knights
        PieceList knights = board.knights[opponentColorIndex];
        boolean knightChecks = false;
        for(int i=0; i<knights.count; i++){
            startSquare = knights.occupiedSquares[i];

            long currentKnightMask = PrecomputedData.knightAttackMask[startSquare];
            knightAttackMask |= currentKnightMask;

            if(!knightChecks && BoardUtility.overlapingSquares(currentKnightMask, kingSquare)){
                inDoubleCheck = inCheck;
                inCheck = true;
                knightChecks = true;
                checkRayMask |= 1L << startSquare;
            }
        }

        // attack and check mask for pawns
        PieceList pawns = board.pawns[opponentColorIndex];
        boolean pawnChecks = false;
        for(int i=0; i< pawns.count; i++){
            startSquare = pawns.occupiedSquares[i];

            long currentPawnMask = PrecomputedData.pawnAttackMask[startSquare][opponentColorIndex];
            pawnAttackMask |= currentPawnMask;

            if(!pawnChecks && BoardUtility.overlapingSquares(currentPawnMask, kingSquare)){
                inDoubleCheck = inCheck;
                inCheck = true;
                pawnChecks = true;
                checkRayMask |= 1L << startSquare;
            }
        }

        // king attack mask
        long kingAttackMask = PrecomputedData.kingAttackMask[board.kingIndex[opponentColorIndex]];

        attackMaskNoPawns = slidingAttackMask | knightAttackMask | kingAttackMask;
        attackMask = attackMaskNoPawns | pawnAttackMask;
    }

    void GenerateSlidingAttackMask(){
        PieceList queens = board.queens[opponentColorIndex];
        for(int i=0; i<queens.count; i++){
            UpdateSlidingAttackMask(queens.occupiedSquares[i], 0, 8);
        }

        PieceList bishops = board.bishops[opponentColorIndex];
        for(int i=0; i<bishops.count; i++){
            UpdateSlidingAttackMask(bishops.occupiedSquares[i], 4, 8);
        }

        PieceList rooks = board.rooks[opponentColorIndex];
        for(int i=0; i<rooks.count; i++){
            UpdateSlidingAttackMask(rooks.occupiedSquares[i], 0, 4);
        }
    }

    void UpdateSlidingAttackMask(int startSquare, int startIndex, int endIndex){
        for(int dirIndex = startIndex; dirIndex < endIndex; dirIndex++){
            for(int i=0; i<PrecomputedData.distanceToEdge[startSquare][dirIndex]; i++){
                int targetSquareIndex = startSquare + (i + 1) * PrecomputedData.moveDirOffset[dirIndex];

                slidingAttackMask |= 1L << targetSquareIndex;

                if(!Pieces.isNone(board.squares[targetSquareIndex])){
                    if(targetSquareIndex != board.kingIndex[currentColorIndex]) break;
                }
            }
        }
    }
}
