package com.example.chessengine.MyEngine;

public class Move {
    static enum Flag {
        EN_PASSANT,
        PROMOTE_TO_ROOK,
        PROMOTE_TO_QUEEN,
        PROMOTE_TO_BISHOP,
        PROMOTE_TO_KNIGHT,
        PAWN_TWO_SQUARES_FORWARD,
        NONE
    };

    int from, to;
    Flag currentFlag;

    Move(int from, int to){
        this.from = from;
        this.to = to;
        this.currentFlag = Flag.NONE;
    }
    Move(int from, int to, Flag f){
        this.from = from;
        this.to = to;
        this.currentFlag = f;
    }
}
