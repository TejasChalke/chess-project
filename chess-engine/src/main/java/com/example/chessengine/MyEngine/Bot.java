package com.example.chessengine.MyEngine;

import java.util.List;

public class Bot {
    Board board;
    Generator generator;

    public Bot(){
        this.board = new Board();
        this.generator = new Generator();
        // board.LoadPosition("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -");

        // check for white castling
        // board.LoadPosition("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -");

        // check for knight moves under check
        // original r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1
        // board.LoadPosition("r3k2r/Pppp1ppp/1b3nbB/nP6/NBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");

        // check for en passant checks
        // original 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -
        // board.LoadPosition("8/8/3p4/KPp4r/1R3p1k/8/4P1P1/8 w - c6");

        board.LoadPosition();
        generator.GenerateMoves(board);
    }

    public Move FindBestMove(){
        List<Move> moves = generator.GenerateMoves(board);

        return null;
    }
}
