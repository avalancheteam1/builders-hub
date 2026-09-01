// (c) 2025, Ava Labs, Inc. All rights reserved.
// See the file LICENSE for licensing terms.

// SPDX-License-Identifier: Ecosystem

pragma solidity ^0.8.28;

/**
 * @title WorkshopToken
 * @notice A minimal ERC-20 token used in the Avalanche Academy "Deploy Your First
 *         Contract" workshop. The deployer picks the name, symbol and initial
 *         supply, and receives the entire supply at deployment.
 *
 *         Every function is written out in full rather than inherited, so a
 *         workshop attendee can read the whole token in a single screen. For a
 *         production token, use a reviewed implementation such as OpenZeppelin's
 *         ERC20 instead of this one.
 */
contract WorkshopToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @param name_ Display name of the token, e.g. "Workshop Token".
     * @param symbol_ Ticker of the token, e.g. "WRK".
     * @param initialSupply Supply in whole tokens. The constructor scales it by
     *        the token's 18 decimals, so passing 1000 mints 1000.000000000000000000.
     */
    constructor(string memory name_, string memory symbol_, uint256 initialSupply) {
        name = name_;
        symbol = symbol_;

        totalSupply = initialSupply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;

        // Minting is represented as a transfer from the zero address, which is
        // what block explorers and wallets look for to display the new supply.
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "WorkshopToken: insufficient allowance");

        // An allowance of type(uint256).max is treated as unlimited and is not
        // decremented, matching the behaviour of common ERC-20 implementations.
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }

        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "WorkshopToken: transfer to the zero address");

        uint256 fromBalance = balanceOf[from];
        require(fromBalance >= value, "WorkshopToken: insufficient balance");

        // Safe to skip the overflow checks: the sender's balance was just
        // verified, and the sum of all balances is capped by totalSupply.
        unchecked {
            balanceOf[from] = fromBalance - value;
            balanceOf[to] += value;
        }

        emit Transfer(from, to, value);
    }
}
