package com.example.chessengine.MyEngine;

public class Board {
    static final int whiteIndex = 0, blackIndex = 1;
    int[] squares;
    // first four bits 0-3 for castle state
    // next four bits 4-7 for enpassant file
    // next five bits 8-13 for captured piece
    // remaining bits for counter
    long currentBoardState;
    boolean whiteToMove;
    int colorToMove, opponentColor, colorToMoveIndex;

    final int whiteKingSideCastleMask = 1, whiteQueenSideCastleMask = 2;
    final int blackKingSideCastleMask = 4, blackQueenSideCastleMask = 8;

    PieceList[] pawns, knights, bishops, rooks, queens;
    int[] kingIndex;

    public void MakeMove(Move move){

    }

    public void UnmakeMove(Move move){

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
    }
}
