package com.example.chessengine.MyEngine;

import java.util.ArrayList;
import java.util.List;

public class Generator {
    List<Move> moves;
    Board board;
    long attackMask, attackMaskNoPawns, slidingAttackMask, knightAttackMask, pawnAttackMask, checkRayMask, pinRayMask;
    public boolean inCheck, inDoubleCheck, pinsExist, genQuiets;
    int currentColorIndex, opponentColorIndex, kingSquare;

    public List<Move> GenerateMoves(Board board){
        moves = new ArrayList<>();
        this.board = board;
        currentColorIndex = board.colorToMoveIndex;
        kingSquare = board.kingIndex[currentColorIndex];
        genQuiets = true;

        GenerateAttackMask();
        GenerateKingMoves();

        if(inDoubleCheck) return moves;

        GenerateSlidingMoves();
        GenerateKnightMoves();
        GeneratePawnMoves();

        return moves;
    }

    public List<Move> GenerateMoves(Board board, boolean attacksOnly){
        moves = new ArrayList<>();
        this.board = board;
        currentColorIndex = board.colorToMoveIndex;
        kingSquare = board.kingIndex[currentColorIndex];
        genQuiets = attacksOnly;

        GenerateAttackMask();
        GenerateKingMoves();

        if(inDoubleCheck) return moves;

        GenerateSlidingMoves();
        GenerateKnightMoves();
        GeneratePawnMoves();

        return moves;
    }
    
    void GenerateKingMoves(){
        boolean HasKingsideCastleRight = board.whiteToMove ? (board.currentBoardState & 1) != 0 : (board.currentBoardState & 4) != 0;
        boolean HasQueensideCastleRight = board.whiteToMove ? (board.currentBoardState & 2) != 0 : (board.currentBoardState & 8) != 0;

        for (int i = 0; i < PrecomputedData.kingAttackSquares[kingSquare].length; i++) {
            int targetSquare = PrecomputedData.kingAttackSquares[kingSquare][i];
            int pieceOnTargetSquare = board.squares[targetSquare];

            // Skip squares occupied by friendly pieces
            if (Pieces.isSameColor(board.colorToMove, pieceOnTargetSquare)) {
                continue;
            }

            boolean isCapture = Pieces.isSameColor(board.opponentColor, pieceOnTargetSquare);
            if (!isCapture) {
                // King can't move to square marked as under enemy control, unless he is capturing that piece
                // Also skip if not generating quiet moves
                if (!genQuiets || isIntersectingCheck(targetSquare)) {
                    continue;
                }
            }

            // Safe for king to move to this square
            if (!isSquareAttacked(targetSquare)) {
                moves.add(new Move (kingSquare, targetSquare));

                // Castling:
                if (!inCheck && !isCapture) {
                    // Castle kingside
                    if ((targetSquare == BoardUtility.f1 || targetSquare == BoardUtility.f8) && HasKingsideCastleRight) {
                        int castleKingsideSquare = targetSquare + 1;
                        if (board.squares[castleKingsideSquare] == Pieces.None) {
                            if (!isSquareAttacked(castleKingsideSquare)) {
                                moves.add(new Move (kingSquare, castleKingsideSquare, Move.Flag.CASTLE_KING_SIDE));
                            }
                        }
                    }
                    // Castle queenside
                    else if ((targetSquare == BoardUtility.d1 || targetSquare == BoardUtility.d8) && HasQueensideCastleRight) {
                        int castleQueensideSquare = targetSquare - 1;
                        if (board.squares[castleQueensideSquare] == Pieces.None && board.squares[castleQueensideSquare - 1] == Pieces.None) {
                            if (!isSquareAttacked(castleQueensideSquare)) {
                                moves.add(new Move(kingSquare, castleQueensideSquare, Move.Flag.CASTLE_QUEEN_SIDE));
                            }
                        }
                    }
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
        boolean isPinned = isPinned(startSquare);

        // If this piece is pinned, and the king is in check, this piece cannot move
        if (inCheck && isPinned) {
            return;
        }

        for (int directionIndex = startIndex; directionIndex < endIndex; directionIndex++) {
            int currentDirOffset = PrecomputedData.moveDirOffset[directionIndex];

            // If pinned, this piece can only move along the ray towards/away from the friendly king, so skip other directions
            if (isPinned && !isMovingAlongRay(currentDirOffset, kingSquare, startSquare)) {
                continue;
            }

            for (int n = 0; n < PrecomputedData.distanceToEdge[startSquare][directionIndex]; n++) {
                int targetSquare = startSquare + currentDirOffset * (n + 1);
                int targetSquarePiece = board.squares[targetSquare];

                // Blocked by friendly piece, so stop looking in this direction
                if (Pieces.isSameColor(board.colorToMove, targetSquarePiece)) {
                    break;
                }
                boolean isCapture = !Pieces.isNone(targetSquarePiece);

                boolean movePreventsCheck = isIntersectingCheck(targetSquare);
                if (movePreventsCheck || !inCheck) {
                    if(genQuiets || isCapture) moves.add(new Move (startSquare, targetSquare));
                }

                // If square not empty, can't move any further in this direction
                // Also, if this move blocked a check, further moves won't block the check
                if (isCapture || movePreventsCheck) {
                    break;
                }
            }
        }
    }

    void GenerateKnightMoves(){
        PieceList myKnights = board.knights[board.colorToMoveIndex];

        for (int i = 0; i < myKnights.count; i++) {
            int startSquare = myKnights.occupiedSquares[i];
            // Knight cannot move if it is pinned
            if (isPinned(startSquare)) {
                continue;
            }

            for (int knightMoveIndex = 0; knightMoveIndex < PrecomputedData.knightAttackSquares[startSquare].length; knightMoveIndex++) {
                int targetSquare = PrecomputedData.knightAttackSquares[startSquare][knightMoveIndex];
                int targetSquarePiece = board.squares[targetSquare];
                boolean isCapture = Pieces.isSameColor(board.opponentColor, targetSquarePiece);

                if(genQuiets || isCapture){
                    // Skip if square contains friendly piece, or if in check and knight is not interposing/capturing checking piece
                    if (Pieces.isSameColor(board.colorToMove, targetSquarePiece) || (inCheck && !isIntersectingCheck(targetSquare))) {
                        continue;
                    }

                    moves.add(new Move (startSquare, targetSquare));
                }
            }
        }
    }

    void GeneratePawnMoves(){
        PieceList myPawns = board.pawns[currentColorIndex];
        int pawnOffset = (board.colorToMove == Pieces.White) ? 8 : -8;
        int startRank = (board.whiteToMove) ? 1 : 6;
        int finalRankBeforePromotion = (board.whiteToMove) ? 6 : 1;

        int enPassantFile = ((int) (board.currentBoardState >> 4) & 15) - 1;
        int enPassantSquare = -1;
        if (enPassantFile != -1) {
            enPassantSquare = 8 * ((board.whiteToMove) ? 5 : 2) + enPassantFile;
        }


        for (int i = 0; i < myPawns.count; i++) {
            int startSquare = myPawns.occupiedSquares[i];
            int rank = startSquare / 8;
            boolean oneStepFromPromotion = rank == finalRankBeforePromotion;

            if(genQuiets){
                int squareOneForward = startSquare + pawnOffset;

                // Square ahead of pawn is empty: forward moves
                if (board.squares[squareOneForward] == Pieces.None) {
                    // Pawn not pinned, or is moving along line of pin
                    if (!isPinned(startSquare) || isMovingAlongRay(pawnOffset, startSquare, board.kingIndex[board.colorToMoveIndex])) {
                        // Not in check, or pawn is interposing checking piece
                        if (!inCheck || isIntersectingCheck(squareOneForward)) {
                            if (oneStepFromPromotion) {
                                GeneratePromotionMoves(startSquare, squareOneForward);
                            } else {
                                moves.add(new Move (startSquare, squareOneForward));
                            }
                        }

                        // Is on starting square (so can move two forward if not blocked)
                        if (rank == startRank) {
                            int squareTwoForward = squareOneForward + pawnOffset;
                            if (board.squares[squareTwoForward] == Pieces.None) {
                                // Not in check, or pawn is interposing checking piece
                                if (!inCheck || isIntersectingCheck(squareTwoForward)) {
                                    moves.add(new Move (startSquare, squareTwoForward, Move.Flag.PAWN_TWO_SQUARES_FORWARD));
                                }
                            }
                        }
                    }
                }
            }

            for (int j = 0; j < 2; j++) {
                // Check if square exists diagonal to pawn
                if (PrecomputedData.distanceToEdge[startSquare][PrecomputedData.pawnAttackDir[board.colorToMoveIndex][j]] > 0) {
                    // move in direction friendly pawns attack to get square from which enemy pawn would attack
                    int pawnCaptureDir = PrecomputedData.moveDirOffset[PrecomputedData.pawnAttackDir[board.colorToMoveIndex][j]];
                    int targetSquare = startSquare + pawnCaptureDir;
                    int targetPiece = board.squares[targetSquare];

                    // If piece is pinned, and the square it wants to move to is not on same line as the pin, then skip this direction
                    if (isPinned(startSquare) && !isMovingAlongRay(pawnCaptureDir, kingSquare, startSquare)) {
                        continue;
                    }

                    // Regular capture
                    if (Pieces.isSameColor(board.opponentColor, targetPiece)) {
                        // If in check, and piece is not capturing/interposing the checking piece, then skip to next square
                        if (inCheck && !isIntersectingCheck(targetSquare)) {
                            continue;
                        }
                        if (oneStepFromPromotion) {
                            GeneratePromotionMoves(startSquare, targetSquare);
                        } else {
                            moves.add(new Move (startSquare, targetSquare));
                        }
                    }

                    // Capture en-passant
                    if (targetSquare == enPassantSquare) {
                        if (!inCheckAfterEnPassant(startSquare, targetSquare)) {
                            moves.add(new Move (startSquare, targetSquare, Move.Flag.EN_PASSANT));
                        }
                    }
                }
            }
        }
    }

    boolean inCheckAfterEnPassant(int startSquare, int targetSquare){
        int epCapturedPawnSquare = targetSquare + (board.whiteToMove ? -8 : 8);

        // Update board to reflect en-passant capture
        board.squares[targetSquare] = board.squares[startSquare];
        board.squares[startSquare] = Pieces.None;
        board.squares[epCapturedPawnSquare] = Pieces.None;

        boolean inCheckAfterEpCapture = false;
        if (SquareAttackedAfterEPCapture (epCapturedPawnSquare, startSquare)) {
            inCheckAfterEpCapture = true;
        }

        // Undo change to board
        board.squares[targetSquare] = Pieces.None;
        board.squares[startSquare] = Pieces.Pawn | board.colorToMove;
        board.squares[epCapturedPawnSquare] = Pieces.Pawn | board.opponentColor;

        return inCheckAfterEpCapture;
    }
    boolean SquareAttackedAfterEPCapture (int epCaptureSquare, int capturingPawnStartSquare) {
        if (BoardUtility.overlapingSquares(attackMaskNoPawns, kingSquare)) {
            return true;
        }

        // Loop through the horizontal direction towards ep capture to see if any enemy piece now attacks king
        int dirIndex = (epCaptureSquare < kingSquare) ? 2 : 3;
        for (int i = 0; i < PrecomputedData.distanceToEdge[kingSquare][dirIndex]; i++) {
            int squareIndex = kingSquare + PrecomputedData.moveDirOffset[dirIndex] * (i + 1);
            int piece = board.squares[squareIndex];
            if (piece != Pieces.None) {
                // Friendly piece is blocking view of this square from the enemy.
                if (Pieces.isSameColor(board.colorToMove, piece)) {
                    break;
                }

                // This square contains an enemy piece
                else {
                    if (Pieces.isRookOrQueen(piece)) {
                        return true;
                    } else {
                        // This piece is not able to move in the current direction, and is therefore blocking any checks along this line
                        break;
                    }
                }
            }
        }

        // check if enemy pawn is controlling this square (can't use pawn attack bitboard, because pawn has been captured)
        for (int i = 0; i < 2; i++) {
            // Check if square exists diagonal to friendly king from which enemy pawn could be attacking it
            if (PrecomputedData.distanceToEdge[kingSquare][PrecomputedData.pawnAttackDir[board.colorToMoveIndex][i]] > 0) {
                // move in direction friendly pawns attack to get square from which enemy pawn would attack
                int piece = board.squares[kingSquare + PrecomputedData.moveDirOffset[PrecomputedData.pawnAttackDir[board.colorToMoveIndex][i]]];
                if (piece == (Pieces.Pawn | board.opponentColor)) // is enemy pawn
                {
                    return true;
                }
            }
        }

        return false;
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
        return pinsExist && ((pinRayMask >> square) & 1) != 0;
    }

    boolean isIntersectingCheck(int square){
        return inCheck && ((checkRayMask >> square) & 1) != 0;
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
        inCheck = inDoubleCheck = pinsExist = false;
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
                            pinsExist = true;
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
        long currentKnightMask = 0;
        for(int i=0; i<knights.count; i++){
            startSquare = knights.occupiedSquares[i];

            currentKnightMask |= PrecomputedData.knightAttackMask[startSquare];

            if(!knightChecks && BoardUtility.overlapingSquares(currentKnightMask, kingSquare)){
                inDoubleCheck = inCheck;
                inCheck = true;
                knightChecks = true;
                checkRayMask |= 1L << startSquare;
            }
        }
        knightAttackMask |= currentKnightMask;

        // attack and check mask for pawns
        PieceList pawns = board.pawns[opponentColorIndex];
        boolean pawnChecks = false;
        long currentPawnMask = 0;
        for(int i=0; i< pawns.count; i++){
            startSquare = pawns.occupiedSquares[i];

            currentPawnMask |= PrecomputedData.pawnAttackMask[startSquare][opponentColorIndex];

            if(!pawnChecks && BoardUtility.overlapingSquares(currentPawnMask, kingSquare)){
                inDoubleCheck = inCheck;
                inCheck = true;
                pawnChecks = true;
                checkRayMask |= 1L << startSquare;
            }
        }
        pawnAttackMask |= currentPawnMask;

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
