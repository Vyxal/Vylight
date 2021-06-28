// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"))
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod)
  else
    mod(CodeMirror)
})(function(CodeMirror) {
    "use strict"
    const NUMBER_CHARS = '0123456789.';
    const MOD_CHARS = 'vß¨ø∆kÞ⁺₌₍';
    const FUNC_CHARS = 'ƛ\'λµ⁽‡≬;'
    const OPENING = '{[(⟨';
    const CLOSING = '}])⟩';
    const VAR_CHARS = 'abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'
    CodeMirror.defineMode("vyxal", function() {
        return {
            startState: function() {
                return {
                    structure: 'NONE',
                    scc: 0,
                    struct_nest: [],
                }
            },
            token: function(stream, state) {
                console.log(state.structure)
                if(stream.sol() && state.structure == 'COMMENT'){
                    state.structure = 'NONE';
                }
                var char = stream.next().toString();
                if(state.structure == 'COMMENT') return 'comment';
                if(char == '#' && state.structure == 'NONE'){
                    state.structure = 'COMMENT';
                    return 'comment'
                } 
                if(state.structure == 'FUNC_DEF'){
                    if(char == '|') state.structure = 'NONE';
                    return 'function';
                }
                if(state.structure == 'FUNC_CALL'){
                    if(char == ';') structure = 'NONE'
                    return 'function';
                }
                if(char == '`'){
                    if(state.structure == 'STRING'){
                        state.structure = 'NONE'
                    } else {
                        state.structure = 'STRING'
                    }
                    return 'string'
                }
                if(state.structure == 'STRING') return 'string';
                if(state.structure == 'CHAR'){
                    state.structure = 'NONE'
                    return 'string'
                }
                if(char == '\\' && state.structure == 'NONE'){
                    state.structure = 'CHAR';
                    return 'string'
                }
                if(char == '‛' && state.structure == 'NONE'){
                    state.structure = 'SCC';
                    state.scc = 2;
                    return 'string'
                }
                if(state.structure == 'SCC'){
                    state.scc--;
                    if(state.scc == 0) state.structure = 'NONE';
                    return 'string'
                }
                if((state.structure == 'COMP_STRING' && char !== '«') || (state.structure == 'COMP_INT' && char !== '»')) return 'comp'
                if(char == '«'){
                    if(state.structure == 'COMP_STRING'){
                        state.structure = 'NONE'
                    } else {
                        state.structure = 'COMP_STRING'
                    }
                    return 'comp'
                }
                if(char == '»'){
                    if(state.structure == 'COMP_INT'){
                        state.structure = 'NONE'
                    } else {
                        state.structure = 'COMP_INT'
                    }
                    return 'comp'
                }
                if(NUMBER_CHARS.includes(char) && state.structure == 'NONE') return 'number'
                if(MOD_CHARS.includes(char) && state.structure == 'NONE') return 'mod'
                if(FUNC_CHARS.includes(char) && state.structure == 'NONE') return 'function'
                if(OPENING.includes(char)){
                    state.struct_nest.push(char)
                    if(char == '('){
                        if(stream.match(/^[a-zA-Z_]+\|/,false)) state.structure = 'VAR';
                    }
                    if(char == '⟨') return 'list'
                    return 'keyword'
                }
                if('←→'.includes(char) && state.structure == 'NONE'){
                    state.structure = 'VAR'; 
                    return 'var';
                }
                if(char == '@' && state.structure == 'NONE'){
                    if(stream.match(/^[a-zA-Z_]+(\:([a-zA-Z_]|\d)+)*|/)){
                        state.structure = 'FUNC_DEF';
                    } else {
                        state.structure = 'FUNC_CALL';
                    }
                    return 'function';
                }
                if(char == '|' && state.structure == 'NONE'){
                    if([...state.struct_nest].pop() == '⟨') return 'list'
                    return 'keyword'
                }
                if(state.structure == 'VAR' && VAR_CHARS.includes(char)) return 'var';
                if(CLOSING.includes(char)){
                    state.struct_nest.pop()
                    if(char == '⟩') return 'list'
                    return 'keyword';
                }
                return 'none'
            }
        };
    });
});
