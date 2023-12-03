package com.example.chessengine.MyEngine;

import java.util.ArrayList;
import java.util.List;

public class Generator {
    List<Move> moves;
    Board board;
    long attackMask;
    public List<Move> GenerateMoves(Board board){
        moves = new ArrayList<>();
        this.board = board;

        generateAttackMask();

        return moves;
    }

    void generateAttackMask(){

    }
}
