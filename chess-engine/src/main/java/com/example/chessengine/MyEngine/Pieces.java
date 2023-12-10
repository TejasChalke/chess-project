package com.example.chessengine.MyEngine;

public class Pieces {
    public static final int None = 0;
    public static final int King = 1;
    public static final int Pawn = 2;
    public static final int Bishop = 3;
    public static final int Knight = 4;
    public static final int Rook = 5;
    public static final int Queen = 6;
    public static final int White = 8;
    public static final int Black = 16;

    public static boolean isSameColor(int color, int piece){
        color &= 24;
        piece &= 24;

        return color == piece;
    }


    public static boolean isWhite(int piece){
        return (piece & 24) == Pieces.White;
    }

    public static boolean isNone(int piece){
        return (piece & 7) == Pieces.None;
    }

    public static boolean isKing(int piece){
        return (piece & 7) == Pieces.King;
    }

    public static boolean isQueen(int piece){
        return (piece & 7) == Pieces.Queen;
    }

    public static boolean isPawn(int piece){
        return (piece & 7) == Pieces.Pawn;
    }

    public static boolean isRook(int piece){
        return (piece & 7) == Pieces.Rook;
    }

    public static boolean isBishop(int piece){
        return (piece & 7) == Pieces.Bishop;
    }

    public static boolean isKnight(int piece){
        return (piece & 7) == Pieces.Knight;
    }

    public static boolean isBishopOrQueen(int piece){
        return ((piece & 7) == Pieces.Bishop) || ((piece & 7) == Pieces.Queen);
    }

    public static boolean isRookOrQueen(int piece){
        return ((piece & 7) == Pieces.Rook) || ((piece & 7) == Pieces.Queen);
    }

    public static int getPiece(Move.Flag flag){
        return switch (flag){
            case PROMOTE_TO_QUEEN -> Queen;
            case PROMOTE_TO_ROOK -> Rook;
            case PROMOTE_TO_KNIGHT -> Knight;
            case PROMOTE_TO_BISHOP -> Bishop;
            default -> None;
        };
    }

    public static int PieceType(int piece){
        return piece & 7;
    }
}
