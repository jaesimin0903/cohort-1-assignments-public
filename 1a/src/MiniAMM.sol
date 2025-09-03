// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMM, IMiniAMMEvents} from "./IMiniAMM.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMM is IMiniAMM, IMiniAMMEvents {
    uint256 public k = 0;
    uint256 public xReserve = 0;
    uint256 public yReserve = 0;

    address public tokenX;
    address public tokenY;

    // implement constructor
    constructor(address _tokenX, address _tokenY) {
        require(_tokenX != address(0), "tokenX cannot be zero address");
        require(_tokenY != address(0), "tokenY cannot be zero address");
        require(_tokenX != _tokenY, "Tokens must be different");

        //always set tokens in order X < Y
        if (_tokenX > _tokenY) {
            address temp = _tokenX;
            _tokenX = _tokenY;
            _tokenY = temp;
        }

        // 실제 변수에 할당
        tokenX = _tokenX;
        tokenY = _tokenY;

        // 초기 리저브는 0으로 설정 (아직 토큰이 없음)
        xReserve = 0;
        yReserve = 0;
        k = 0;
    }

    // add parameters and implement function.
    // this function will determine the initial 'k'.
    function _addLiquidityFirstTime(
        uint256 xAmountIn,
        uint256 yAmountIn
    ) internal {
        IERC20(address(tokenX)).transferFrom(msg.sender, address(this), xAmountIn);
        IERC20(address(tokenY)).transferFrom(msg.sender, address(this), yAmountIn);

        xReserve = xAmountIn;
        yReserve = yAmountIn;
        k = xAmountIn * yAmountIn;

        emit AddLiquidity(xAmountIn, yAmountIn);
    }

    // add parameters and implement function.
    // this function will increase the 'k'
    // because it is transferring liquidity from users to this contract.
    function _addLiquidityNotFirstTime(
        uint256 xAmountIn,
        uint256 yAmountIn
    ) internal {
        require(
            xAmountIn > 0 && yAmountIn > 0,
            "Amount must be greater than 0"
        );
        uint256 yRequired = (xAmountIn * yReserve) / xReserve;
        require(yAmountIn == yRequired, "Insufficient y amount");

        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yRequired);

        xReserve += xAmountIn;
        yReserve += yRequired;
        k = xReserve * yReserve;
    }

    // complete the function
    function addLiquidity(uint256 xAmountIn, uint256 yAmountIn) external {
        require(
            xAmountIn > 0 && yAmountIn > 0,
            "Amounts must be greater than 0"
        );
        if (k == 0) {
            // add params
            _addLiquidityFirstTime(xAmountIn, yAmountIn);
        } else {
            // add params
            _addLiquidityNotFirstTime(xAmountIn, yAmountIn);
        }

        emit AddLiquidity(xAmountIn, yAmountIn);
    }

    // complete the function
    function swap(uint256 xAmountIn, uint256 yAmountIn) external {
        require(xAmountIn > 0 || yAmountIn > 0, "Must swap at least one token");
        require(
            xAmountIn == 0 || yAmountIn == 0,
            "Can only swap one direction at a time"
        );

        // Check if pool has liquidity first
        require(xReserve > 0 && yReserve > 0, "No liquidity in pool");

        if (xAmountIn > 0) {
            // Swap X for Y
            require(xAmountIn <= xReserve, "Insufficient liquidity");
            IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);

            uint256 xReserveNew = xReserve + xAmountIn;
            uint256 yReserveNew = (k * 1000) / (xReserveNew * 1000);
            uint256 yAmountOut = yReserve - yReserveNew;

            require(yAmountOut > 0, "No liquidity in pool");

            xReserve = xReserveNew;
            yReserve = yReserveNew;

            IERC20(tokenY).transfer(msg.sender, yAmountOut);
            emit Swap(xAmountIn, yAmountOut);
        } else {
            // Swap Y for X
            require(yAmountIn <= yReserve, "Insufficient liquidity" );
            IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);

            uint256 yReserveNew = yReserve + yAmountIn;
            uint256 xReserveNew = (k * 1000) / (yReserveNew * 1000);
            uint256 xAmountOut = xReserve - xReserveNew;

            require(xAmountOut > 0, "No liquidity in pool");

            xReserve = xReserveNew;
            yReserve = yReserveNew;

            IERC20(tokenX).transfer(msg.sender, xAmountOut);
            emit Swap(yAmountIn, xAmountOut);
        }
    }
}
