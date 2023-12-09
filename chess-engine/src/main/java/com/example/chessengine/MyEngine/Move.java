package com.example.chessengine.MyEngine;

public class Move {
    public static enum Flag {
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

    public static Move invalidMove = new Move(-1, -1, Flag.NONE);

    static boolean isPromotion(Flag flag){
        return switch (flag) {
            case PROMOTE_TO_BISHOP, PROMOTE_TO_KNIGHT, PROMOTE_TO_ROOK, PROMOTE_TO_QUEEN -> true;
            default -> false;
        };
    }

    int from, to;
    Flag currentFlag;

    public Move(){
        this.from = -1;
        this.to = -1;
        currentFlag = Flag.NONE;
    }

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public int getTo() {
        return to;
    }

    public void setTo(int to) {
        this.to = to;
    }

    public Flag getCurrentFlag() {
        return currentFlag;
    }

    public void setCurrentFlag(Flag currentFlag) {
        this.currentFlag = currentFlag;
    }

    public Move(int from, int to){
        this.from = from;
        this.to = to;
        this.currentFlag = Flag.NONE;
    }

    public Move(int from, int to, Flag f){
        this.from = from;
        this.to = to;
        this.currentFlag = f;
    }
}
