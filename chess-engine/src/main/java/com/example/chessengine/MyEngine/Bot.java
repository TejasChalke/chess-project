package com.example.chessengine.MyEngine;

import java.util.ArrayList;
import java.util.List;

public class Bot {
    Board board;
    Generator generator;

    public Bot() {
        this.board = new Board();
        this.generator = new Generator();
        board.LoadPosition("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10");

//        board.LoadPosition();
        List<String> curr = null;
        System.out.println(board.currentBoardState & 15);
        for (int i = 1; i <= 5; i++) {
            curr = new ArrayList<>();
            System.out.println(i + " -> " + TestMoveGeneration(i, curr));
            System.out.println("====================================");
            System.out.println("====================================");
        }
    }

    int TestMoveGeneration(int depth, List<String> curr){
        if(depth == 0) return 1;
        List<Move> moves = generator.GenerateMoves(board);

        int cnt = 0;

        for(Move m: moves){
//            curr.add(board.colorToMoveIndex + ", " + Integer.toString(m.from) + " | " + board.squares[m.from] + " | " + " -> " + Integer.toString(m.to) + " -> ");
            if(board.squares[m.from] == Pieces.None) {
                for(Move m1: moves) System.out.println(m1.from + " -> " + m1.to + " : " + m1.piece);
//                System.out.println(curr);
//                curr.remove(curr.size() - 1);
                continue;
            }

            board.MakeMove(m);
            cnt += TestMoveGeneration(depth - 1, curr);
            board.UnmakeMove(m);
        }

        return cnt;
    }

    public Move FindBestMove(){
        List<Move> moves = generator.GenerateMoves(board);

        return null;
    }
}
