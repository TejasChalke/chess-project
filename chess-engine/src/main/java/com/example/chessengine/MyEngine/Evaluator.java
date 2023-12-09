package com.example.chessengine.MyEngine;

public class Evaluator {

    Board board;
    public final int pawnValue = 100;
    public final int knightValue = 300;
    public final int bishopValue = 320;
    public final int rookValue = 500;
    public final int queenValue = 900;
    public int Evaluate(Board board){
        this.board = board;
        int whiteEval = 0;
        int blackEval = 0;

        int whiteMaterial = CountMaterial (Board.whiteIndex);
        int blackMaterial = CountMaterial (Board.blackIndex);

//        int whiteMaterialWithoutPawns = whiteMaterial - board.pawns[Board.whiteIndex].count * pawnValue;
//        int blackMaterialWithoutPawns = blackMaterial - board.pawns[Board.blackIndex].count * pawnValue;
//        float whiteEndgamePhaseWeight = EndgamePhaseWeight (whiteMaterialWithoutPawns);
//        float blackEndgamePhaseWeight = EndgamePhaseWeight (blackMaterialWithoutPawns);

        whiteEval += whiteMaterial;
        blackEval += blackMaterial;
//        whiteEval += MopUpEval (Board.whiteIndex, Board.blackIndex, whiteMaterial, blackMaterial, blackEndgamePhaseWeight);
//        blackEval += MopUpEval (Board.blackIndex, Board.whiteIndex, blackMaterial, whiteMaterial, whiteEndgamePhaseWeight);

//        whiteEval += EvaluatePieceSquareTables (Board.whiteIndex, blackEndgamePhaseWeight);
//        blackEval += EvaluatePieceSquareTables (Board.blackIndex, whiteEndgamePhaseWeight);

        int eval = whiteEval - blackEval;

        int perspective = (board.whiteToMove) ? 1 : -1;
        return eval * perspective;
    }

    int CountMaterial (int colourIndex) {
        int material = 0;
        material += board.pawns[colourIndex].count * pawnValue;
        material += board.knights[colourIndex].count * knightValue;
        material += board.bishops[colourIndex].count * bishopValue;
        material += board.rooks[colourIndex].count * rookValue;
        material += board.queens[colourIndex].count * queenValue;

        return material;
    }
}
