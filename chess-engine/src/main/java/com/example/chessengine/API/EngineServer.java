package com.example.chessengine.API;

import com.example.chessengine.MyEngine.AI.Bot;
import com.example.chessengine.MyEngine.Move;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EngineServer {

    Bot bot;
    @CrossOrigin("*")
    @GetMapping("/setboard")
    ResponseEntity<String> setBoard(){
        if(this.bot == null){
            bot = new Bot();
        }else{
            bot.ResetBoard();
        }

        return ResponseEntity.ok("Board Set");
    }

    @CrossOrigin("*")
    @PostMapping("/makemove")
    ResponseEntity<String> makeMove(@RequestBody MyRequestBody body){
        Move.Flag playerFlag = switch (body.currentFlag){
            case "EN_PASSANT" -> Move.Flag.EN_PASSANT;
            case "PAWN_TWO_SQUARES_FORWARD" -> Move.Flag.PAWN_TWO_SQUARES_FORWARD;
            case "CASTLE_KING_SIDE" -> Move.Flag.CASTLE_KING_SIDE;
            case "CASTLE_QUEEN_SIDE" -> Move.Flag.CASTLE_QUEEN_SIDE;
            case "PROMOTE_TO_QUEEN" -> Move.Flag.PROMOTE_TO_QUEEN;
            case "PROMOTE_TO_ROOK" -> Move.Flag.PROMOTE_TO_ROOK;
            case "PROMOTE_TO_BISHOP" -> Move.Flag.PROMOTE_TO_BISHOP;
            case "PROMOTE_TO_KNIGHT" -> Move.Flag.PROMOTE_TO_KNIGHT;
            default -> Move.Flag.NONE;
        };

        // make the player move
        Move playerMove = new Move(body.from, body.to, playerFlag);
        this.bot.board.MakeMove(playerMove);

//        System.out.println("After player move");
//        BoardUtility.displayPosition(bot.board.squares, 0, true);

        return ResponseEntity.ok("Move made!");
    }

    @CrossOrigin("*")
    @GetMapping("/playmove")
    Move playMove(){
        Move move = this.bot.MakeBestMove();
//        System.out.println("After player move");
//        BoardUtility.displayPosition(bot.board.squares, 0, true);

        return move;
    }

    @CrossOrigin("*")
    @GetMapping("/getlegalmoves")
    List<Move> getLegalMoves(){
        List<Move> moves = this.bot.GenerateLegalMoves();
        if(moves.isEmpty()){
            if(this.bot.generator.inCheck){
                // checkmate
                moves.add(new Move(-1, -1));
            }else{
                // stalemate
                moves.add(new Move(-2, -2));
            }
        }

        return moves;
    }
}
