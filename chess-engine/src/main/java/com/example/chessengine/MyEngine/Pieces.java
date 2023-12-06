package com.example.chessengine.MyEngine;

public class Pieces {
    static final int None = 0;
    static final int King = 1;
    static final int Pawn = 2;
    static final int Bishop = 3;
    static final int Knight = 4;
    static final int Rook = 5;
    static final int Queen = 6;
    static final int White = 8;
    static final int Black = 16;

    static boolean isSameColor(int color, int piece){
        color &= 24;
        piece &= 24;

        return color == piece;
    }


    static boolean isWhite(int piece){
        return (piece & 24) == Pieces.White;
    }

    static boolean isNone(int piece){
        return (piece & 7) == Pieces.None;
    }

    static boolean isKing(int piece){
        return (piece & 7) == Pieces.King;
    }

    static boolean isQueen(int piece){
        return (piece & 7) == Pieces.Queen;
    }

    static boolean isPawn(int piece){
        return (piece & 7) == Pieces.Pawn;
    }

    static boolean isRook(int piece){
        return (piece & 7) == Pieces.Rook;
    }

    static boolean isBishop(int piece){
        return (piece & 7) == Pieces.Bishop;
    }

    static boolean isKnight(int piece){
        return (piece & 7) == Pieces.Knight;
    }

    static boolean isBishopOrQueen(int piece){
        return ((piece & 7) == Pieces.Bishop) || ((piece & 7) == Pieces.Queen);
    }

    static boolean isRookOrQueen(int piece){
        return ((piece & 7) == Pieces.Rook) || ((piece & 7) == Pieces.Queen);
    }

    static int getPiece(Move.Flag flag){
        return switch (flag){
            case PROMOTE_TO_QUEEN -> Queen;
            case PROMOTE_TO_ROOK -> Rook;
            case PROMOTE_TO_KNIGHT -> Knight;
            case PROMOTE_TO_BISHOP -> Bishop;
            default -> None;
        };
    }

    static int PieceType(int piece){
        return piece & 7;
    }
}
