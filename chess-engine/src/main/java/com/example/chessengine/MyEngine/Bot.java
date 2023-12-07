package com.example.chessengine.MyEngine;

import java.util.ArrayList;
import java.util.List;

public class Bot {
    public Board board;
    public Generator generator;

    public Bot() {
        this.board = new Board();
        this.generator = new Generator();
        board.LoadPosition();

//        board.LoadPosition("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10");
//
//        for (int i = 1; i <= 5; i++) {
//            System.out.println(i + " -> " + TestMoveGeneration(i));
//            System.out.println("====================================");
//            System.out.println("====================================");
//        }
    }

    public void ResetBoard() { board.LoadPosition(); }
    public List<Move> GenerateLegalMoves() { return generator.GenerateMoves(board); }

    int TestMoveGeneration(int depth){
        if(depth == 0) return 1;
        List<Move> moves = generator.GenerateMoves(board);

        int cnt = 0;

        for(Move m: moves){
            if(board.squares[m.from] == Pieces.None) {
                for(Move m1: moves) System.out.println(m1.from + " -> " + m1.to);
                continue;
            }

            board.MakeMove(m);
            cnt += TestMoveGeneration(depth - 1);
            board.UnmakeMove(m);
        }

        return cnt;
    }

    public Move MakeBestMove(){
        // find best move

        // make the best move
        List<Move> moves = GenerateLegalMoves();
        int idx = (int)(Math.random() * moves.size());

        Move bestMove = moves.get(idx >= moves.size() ? idx - 1 : idx);
        this.board.MakeMove(bestMove);

        return bestMove;
    }

    public Move FindBestMove(){
        List<Move> moves = GenerateLegalMoves();

        return null;
    }
}
