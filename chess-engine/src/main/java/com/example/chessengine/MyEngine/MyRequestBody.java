package com.example.chessengine.MyEngine;

import java.util.List;

public class MyRequestBody {

    static class BoardState {
        public int toPlay;
        public String castling;
        public String enPassant;
    }

    public List<Integer> pieces;
    public BoardState boardState;
}
