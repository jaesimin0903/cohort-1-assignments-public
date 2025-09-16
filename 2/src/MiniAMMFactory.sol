// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMMFactory} from "./IMiniAMMFactory.sol";
import {MiniAMM} from "./MiniAMM.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMMFactory is IMiniAMMFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairNumber);
    
    constructor() {}
    
    // implement
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
    
    // implement
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "Identical addresses");
        //check duplicates
        require(getPair[tokenA][tokenB] == address(0), "Pair exists");
        require(getPair[tokenB][tokenA] == address(0), "Pair exists");
        //check if tokenA or tokenB is zero address
        require(tokenA != address(0), "Zero address");
        require(tokenB != address(0), "Zero address");

        pair = address(new MiniAMM(tokenA, tokenB));
        
        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;

        allPairs.push(pair);

        // Sort tokens for event emission (same as MiniAMM constructor)
        address token0 = tokenA < tokenB ? tokenA : tokenB;
        address token1 = tokenA < tokenB ? tokenB : tokenA;

        emit PairCreated(token0, token1, pair, allPairs.length);

        return pair;
    }
}
