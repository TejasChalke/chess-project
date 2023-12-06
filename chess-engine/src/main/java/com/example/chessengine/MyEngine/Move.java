package com.example.chessengine.MyEngine;

public class Move {
    static enum Flag {
        EN_PASSANT,
        CASTLE_KING_SIDE,
        CASTLE_QUEEN_SIDE,
        PROMOTE_TO_ROOK,
        PROMOTE_TO_QUEEN,
        PROMOTE_TO_BISHOP,
        PROMOTE_TO_KNIGHT,
        PAWN_TWO_SQUARES_FORWARD,
        NONE
    };

    static boolean isPromotion(Flag flag){
        return switch (flag) {
            case PROMOTE_TO_BISHOP, PROMOTE_TO_KNIGHT, PROMOTE_TO_ROOK, PROMOTE_TO_QUEEN -> true;
            default -> false;
        };
    }

    int from, to, piece;
    Flag currentFlag;

    Move(int from, int to){
        this.from = from;
        this.to = to;
        this.currentFlag = Flag.NONE;
        this.piece = 0;
    }
    Move(int from, int to, int piece){
        this.from = from;
        this.to = to;
        this.currentFlag = Flag.NONE;
        this.piece = piece;
    }
    Move(int from, int to, Flag f){
        this.from = from;
        this.to = to;
        this.currentFlag = f;
        this.piece = 0;
    }

    Move(int from, int to, Flag f, int piece){
        this.from = from;
        this.to = to;
        this.currentFlag = f;
        this.piece = piece;
    }
}
