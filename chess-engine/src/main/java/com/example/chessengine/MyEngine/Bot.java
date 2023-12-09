package com.example.chessengine.MyEngine;

import java.util.List;

public class Bot {
    public Board board;
    public Generator generator;
    public Evaluator evaluator;
    Move currentBestMove;
    int currentBestEval, infinity;

    public Bot() {
        this.board = new Board();
        this.generator = new Generator();
        this.evaluator = new Evaluator();
        this.infinity = 999999;
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
        currentBestMove = Move.invalidMove;
        currentBestEval = -infinity;
        // find best move
        int eval = FindBestMove(4, 0, -infinity, infinity);
        Move bestMove = currentBestMove;

        // make the best move
        if(!bestMove.equals(Move.invalidMove)){
            this.board.MakeMove(bestMove);
        }else{
            // checkmate -1, -1
            // stalemate -2, -2
            if(eval == 0) {
                bestMove = new Move(-2, -2);
            }
        }
        return bestMove;
    }

    public int FindBestMove(int depth, int movesFromRoot, int alpha, int beta){
        if(depth == 0){
            return evaluator.Evaluate(board);
        }

        List<Move> moves = generator.GenerateMoves(board);
        if (moves.isEmpty()) {
            if (generator.inCheck) {
                return -(infinity - movesFromRoot);
            } else {
                return 0;
            }
        }

        Move bestMoveInThisPosition = Move.invalidMove;
        for (Move move : moves) {
            board.MakeMove(move);
            int eval = -FindBestMove(depth - 1, movesFromRoot + 1, -beta, -alpha);
            board.UnmakeMove(move);

            // Move was *too* good, so opponent won't allow this position to be reached
            // (by choosing a different move earlier on). Skip remaining moves.
            if (eval >= beta) {
                return beta;
            }

            // Found a new best move in this position
            if (eval > alpha) {
                bestMoveInThisPosition = move;

                alpha = eval;
                if (movesFromRoot == 0) {
                    currentBestMove = move;
                    currentBestEval = eval;
                }
            }
        }

        return alpha;
    }
}
