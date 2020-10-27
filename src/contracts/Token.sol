pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Token{

	using SafeMath for uint;

	string public name = "DApp Token";
	string public symbol = "DAPP";
	uint256 public decimals = 18;
	uint256 public totalSupply;

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowence;

	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed ownner, address indexed exchange, uint256 value);

	constructor() public{
		totalSupply = 100000000 * (10 ** decimals);
		balanceOf[msg.sender] = totalSupply;
	}

	function transfer(address _to, uint256 _value) public returns(bool success){
			
		require(balanceOf[msg.sender] >= _value);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != address(0));
		balanceOf[_from] = balanceOf[_from].sub(_value);
		balanceOf[_to] = balanceOf[_to].add(_value);
		emit Transfer(_from, _to, _value);
	}

	function approve(address _spender, uint256 _value) public returns (bool success){
		require(_spender != address(0));
		
		allowence[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
		uint256 _allowence = allowence[_from][msg.sender];
		require(balanceOf[_from] >= _value);
		require(_allowence >= _value );

		allowence[_from][msg.sender] = _allowence.sub(_value);
		_transfer(_from, _to, _value);
		return true;
	}

	

}