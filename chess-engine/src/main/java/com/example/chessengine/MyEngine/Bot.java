package com.example.chessengine.MyEngine;

import java.util.List;

public class Bot {
    Board board;
    Generator generator;

    public Bot(){
        this.board = new Board();
        this.generator = new Generator();
        board.LoadPosition();
    }

    public Move FindBestMove(){
        List<Move> moves = generator.GenerateMoves(board);

        return null;
    }
}
