package com.example.chessengine.MyEngine;

import java.util.Stack;

public class Board {
    public static final int whiteIndex = 0, blackIndex = 1;
    final int removeWhiteKingSideMask = 0b1111111111111110;
    final int removeWhiteQueenSideMask = 0b1111111111111101;
    final int removeBlackKingSideMask = 0b1111111111111011;
    final int removeBlackQueenSideMask = 0b1111111111110111;
    public int[] squares;
    // first four bits 0-3 for castle state
    // next four bits 4-7 for enpassant file
    // next five bits 8-12 for captured piece
    // remaining bits for counter
    int currentBoardState;
    Stack<Integer> boardStateHistory;
    public boolean whiteToMove;
    int colorToMove, opponentColor, colorToMoveIndex;

    public PieceList[] pawns, knights, bishops, rooks, queens;
    int[] kingIndex;

    public void MakeMove(Move move){
        // System.out.println("Make");
        int originalCastleState = currentBoardState & 15;
        int newCastleState = originalCastleState;
        currentBoardState = 0;

        int opponentColourIndex = 1 - colorToMoveIndex;
        int moveFrom = move.from;
        int moveTo = move.to;

        int capturedPieceType = Pieces.isNone(squares[moveTo]) ? Pieces.None : (Pieces.PieceType(squares[moveTo]) | opponentColor);
        int movePiece = squares[moveFrom];
        int movePieceType = Pieces.PieceType (movePiece);

        Move.Flag moveFlag = move.currentFlag;
        boolean isPromotion = Move.isPromotion(moveFlag);
        boolean isEnPassant = moveFlag == Move.Flag.EN_PASSANT;

        // Handle captures
        currentBoardState |= (int)(capturedPieceType << 8);
        if (!Pieces.isNone(capturedPieceType) && !Pieces.isKing(capturedPieceType)) {
//             System.out.println(movePieceType + " : " + moveFrom + " ->> " + moveTo + " : " + capturedPieceType);
            GetPieceList(capturedPieceType & 7, opponentColourIndex).removePiece(moveTo);
        }

        // Move pieces in piece lists
        if (Pieces.isKing(movePieceType)) {
            kingIndex[colorToMoveIndex] = moveTo;
            newCastleState &= (whiteToMove) ? (removeWhiteKingSideMask & removeWhiteQueenSideMask) : (removeBlackKingSideMask & removeBlackQueenSideMask);
        } else {
            // System.out.println("from here");
            GetPieceList(movePieceType & 7, colorToMoveIndex).movePiece(moveFrom, moveTo);
        }

        int pieceOnTargetSquare = movePiece;

        // Handle promotion
        if (isPromotion) {
            int promoteType = 0;
            switch (moveFlag) {
                case PROMOTE_TO_QUEEN:
                    promoteType = Pieces.Queen;
                    queens[colorToMoveIndex].addPiece(moveTo);
                    break;
                case PROMOTE_TO_ROOK:
                    promoteType = Pieces.Rook;
                    rooks[colorToMoveIndex].addPiece(moveTo);
                    break;
                case PROMOTE_TO_BISHOP:
                    promoteType = Pieces.Bishop;
                    bishops[colorToMoveIndex].addPiece(moveTo);
                    break;
                case PROMOTE_TO_KNIGHT:
                    promoteType = Pieces.Knight;
                    knights[colorToMoveIndex].addPiece(moveTo);
                    break;
                default:
                    break;
            }
            pieceOnTargetSquare = promoteType | colorToMove;
            // pawn has already been moved
            pawns[colorToMoveIndex].removePiece(moveTo);
        } else {
            // Handle other special moves (en-passant, and castling)
            switch (moveFlag) {
                case EN_PASSANT:
                    int epPawnSquare = moveTo + ((colorToMove == Pieces.White) ? -8 : 8);
                    currentBoardState |= (int)(squares[epPawnSquare] << 8); // add pawn as capture type
                    squares[epPawnSquare] = 0; // clear ep capture square
                    pawns[opponentColourIndex].removePiece(epPawnSquare);
                    break;
                case CASTLE_KING_SIDE, CASTLE_QUEEN_SIDE:
                    boolean kingside = moveFlag == Move.Flag.CASTLE_KING_SIDE;
                    int castlingRookFromIndex = (kingside) ? moveTo + 1 : moveTo - 2;
                    int castlingRookToIndex = (kingside) ? moveTo - 1 : moveTo + 1;

                    squares[castlingRookFromIndex] = Pieces.None;
                    squares[castlingRookToIndex] = Pieces.Rook | colorToMove;

                    rooks[colorToMoveIndex].movePiece(castlingRookFromIndex, castlingRookToIndex);
                    break;
            }
        }

        // Update the board representation:
        squares[moveTo] = pieceOnTargetSquare;
        squares[moveFrom] = Pieces.None;

        // Pawn has moved two forwards, mark file with en-passant flag
        if (moveFlag == Move.Flag.PAWN_TWO_SQUARES_FORWARD) {
            int file = moveTo % 8 + 1;
            currentBoardState |= (int)(file << 4);
        }

        // Piece moving to/from rook square removes castling right for that side
        if (originalCastleState != 0) {
            if (moveTo == BoardUtility.h1 || moveFrom == BoardUtility.h1) {
                newCastleState &= removeWhiteKingSideMask;
            } else if (moveTo == BoardUtility.a1 || moveFrom == BoardUtility.a1) {
                newCastleState &= removeWhiteQueenSideMask;
            }
            if (moveTo == BoardUtility.h8 || moveFrom == BoardUtility.h8) {
                newCastleState &= removeBlackKingSideMask;
            } else if (moveTo == BoardUtility.a8 || moveFrom == BoardUtility.a8) {
                newCastleState &= removeBlackQueenSideMask;
            }
        }

        currentBoardState |= newCastleState;
        boardStateHistory.push(currentBoardState);

        // Change side to move
        whiteToMove = !whiteToMove;
        colorToMove = (whiteToMove) ? Pieces.White : Pieces.Black;
        opponentColor = (whiteToMove) ? Pieces.Black : Pieces.White;
        colorToMoveIndex = 1 - colorToMoveIndex;
    }

    public void UnmakeMove(Move move){
        // System.out.println("Unmake");
        int opponentColourIndex = colorToMoveIndex;
        boolean undoingWhiteMove = opponentColor == Pieces.White;
        colorToMove = opponentColor; // side who made the move we are undoing
        opponentColor = (undoingWhiteMove) ? Pieces.Black : Pieces.White;
        colorToMoveIndex = 1 - colorToMoveIndex;
        whiteToMove = !whiteToMove;

        int originalCastleState = currentBoardState & 0b1111;

        int capturedPieceType = ((int) currentBoardState >> 8) & 31;
        int capturedPiece = ((int) currentBoardState >> 8) & 31;

        int movedFrom = move.from;
        int movedTo = move.to;
        Move.Flag moveFlags = move.currentFlag;
        boolean isEnPassant = moveFlags == Move.Flag.EN_PASSANT;
        boolean isPromotion = Move.isPromotion(moveFlags);

        int toSquarePieceType = Pieces.PieceType (squares[movedTo]);
        int movedPieceType = (isPromotion) ? Pieces.Pawn : toSquarePieceType;


        int oldEnPassantFile = (currentBoardState >> 4) & 15;

        // ignore ep captures, handled later
        if (!Pieces.isNone(capturedPiece) && !Pieces.isKing(capturedPiece) && !isEnPassant) {
            // System.out.println("from here");
            GetPieceList (capturedPieceType & 7, opponentColourIndex).addPiece(movedTo);
        }

        // Update king index
        if (Pieces.isKing(movedPieceType)) {
            kingIndex[colorToMoveIndex] = movedFrom;
        } else if (!isPromotion) {
            // System.out.println("from there");
            GetPieceList(movedPieceType, colorToMoveIndex).movePiece(movedTo, movedFrom);
        }

        // put back moved piece
        squares[movedFrom] = movedPieceType | colorToMove;
        squares[movedTo] = Pieces.isNone(capturedPiece) ? Pieces.None : capturedPiece; // will be 0 if no piece was captured

        if (isPromotion) {
            pawns[colorToMoveIndex].addPiece(movedFrom);
            switch (moveFlags) {
                case PROMOTE_TO_QUEEN:
                    queens[colorToMoveIndex].removePiece(movedTo);
                    break;
                case PROMOTE_TO_KNIGHT:
                    knights[colorToMoveIndex].removePiece(movedTo);
                    break;
                case PROMOTE_TO_ROOK:
                    rooks[colorToMoveIndex].removePiece(movedTo);
                    break;
                case PROMOTE_TO_BISHOP:
                    bishops[colorToMoveIndex].removePiece(movedTo);
                    break;
            }
        } else if (isEnPassant) { // ep cature: put captured pawn back on right square
            int epIndex = movedTo + ((colorToMove == Pieces.White) ? -8 : 8);
            squares[movedTo] = 0;
            squares[epIndex] = (int) capturedPiece;
            pawns[opponentColourIndex].addPiece(epIndex);
        } else if ((moveFlags == Move.Flag.CASTLE_KING_SIDE) || (moveFlags == Move.Flag.CASTLE_QUEEN_SIDE)) { // castles: move rook back to starting square

            boolean kingside = moveFlags == Move.Flag.CASTLE_KING_SIDE;
            int castlingRookFromIndex = (kingside) ? movedTo + 1 : movedTo - 2;
            int castlingRookToIndex = (kingside) ? movedTo - 1 : movedTo + 1;

            squares[castlingRookToIndex] = 0;
            squares[castlingRookFromIndex] = Pieces.Rook | colorToMove;

            rooks[colorToMoveIndex].movePiece(castlingRookToIndex, castlingRookFromIndex);
        }

        boardStateHistory.pop(); // removes current state from history
        currentBoardState = boardStateHistory.peek(); // sets current state to previous state in history
    }

    PieceList GetPieceList(int pieceType, int colorIndex){
        // System.out.println(pieceType + " " + colorIndex);
        return switch (pieceType & 7){
            case Pieces.Queen -> this.queens[colorIndex];
            case Pieces.Rook -> this.rooks[colorIndex];
            case Pieces.Knight -> this.knights[colorIndex];
            case Pieces.Bishop -> this.bishops[colorIndex];
            case Pieces.Pawn -> this.pawns[colorIndex];
            default -> null;
        };
    }

    public void LoadPosition(){
        LoadData data = FENUtility.loadSquares(FENUtility.startFEN);

        InitializeData(data);
    }

    public void LoadPosition(String fen){
        LoadData data = FENUtility.loadSquares(fen);

        InitializeData(data);
    }

    public void InitializeData(LoadData data){
        squares = data.squares;
        currentBoardState = data.currentBoardState;
        whiteToMove = data.whiteToMove;
        pawns = data.pawnPieces;
        queens = data.queenPieces;
        rooks = data.rookPieces;
        bishops = data.bishopPieces;
        knights = data.knightPieces;
        kingIndex = data.kingIndex;

        colorToMove = whiteToMove ? Pieces.White : Pieces.Black;
        opponentColor = whiteToMove ? Pieces.Black : Pieces.White;
        colorToMoveIndex = whiteToMove ? whiteIndex : blackIndex;

        boardStateHistory = new Stack<>();
        boardStateHistory.push(currentBoardState);
    }
}
