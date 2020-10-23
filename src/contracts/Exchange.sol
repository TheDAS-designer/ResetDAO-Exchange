pragma solidity ^0.5.0;

import "./Token.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Exchange{
	using SafeMath for uint;
	/*
		TODO:
		[X]Set the fee account
		[X]Deposit Ether
		[X]Withdraw Ether
		[X]Deposit tokens
		[X]Withdraw tokens
		[X]Check balances
		[X]Make order
		[X]Cancel order
		[ ]Fill order
		[ ]Charge fees

	*/

	address public feeAccount; //the account that receives exchange
	uint256 public feePersent; //the fee persentage
	address constant ETHER = address(0);
	mapping( address => mapping( address => uint256 )) public tokens; //token and ether
	mapping(uint256 => _Order) public orders;
	mapping(uint256 => bool) public cancelOrders;
	mapping(uint256 => bool) public fillOrders;
 	uint256 public orderCount;


	event Deposit(address indexed token, address indexed user, uint256 value, uint256 balance);
	event Withdraw(address indexed token, address indexed user, uint256 value, uint256 balance);
	event Order(
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 timestamp
		);
	
	event CancelOrder(

			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 timestamp
		);
	event Trade(
			uint256 id,
			address user,
			address userFill,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 feeAmount,
			uint256 timestamp
		);



	struct _Order{
		uint256 id;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp;
	}

	constructor(address _feeAccount, uint256 _feePersent) public{
		feeAccount = _feeAccount;
		feePersent = _feePersent;
	}

	function() external{
		revert();
	}

	function depositEther() payable public {
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function withdrawEther() payable public{
		tokens[ETHER][msg.sender] >= msg.value;
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(msg.value);
		emit Withdraw(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}


	function depositToken(address _token, uint256 _value) public {
		require(_token != ETHER);
		require(msg.sender != address(0));
		require(Token(_token).transferFrom(msg.sender, address(this), _value));
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_value);

		emit Deposit(_token, msg.sender, _value, tokens[_token][msg.sender]);
	}

	function withdrawToken(address _token, uint256 _value) public{
		require(_token != ETHER);
		require(msg.sender != address(0));
		require(Token(_token).transfer(msg.sender, _value));
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_value);

		emit Withdraw(_token, msg.sender, _value, tokens[_token][msg.sender]);
	}

	function balanceOf(address _token, address _user) public view returns(uint256 balance){
		require(_user != address(0));
		return tokens[_token][_user];
	}

	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		orderCount = orderCount.add(1);
		uint256 _timestamp = now;
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, _timestamp);
		
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, _timestamp);
	}	

	function cancelOrder(uint256 _orderId) public{
		_Order storage _order = orders[_orderId];

		require(_order.id == _orderId);
		require(address(_order.user) == msg.sender);

		cancelOrders[_orderId] = true;
		emit CancelOrder(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
	}

	function fillOrder(uint256 _id)  public{
		require( _id > 0 && _id <= orderCount);
		require(!fillOrders[_id]);
		require(!cancelOrders[_id]);
		
		
		_Order storage _order = orders[_id];
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
		fillOrders[_id] = true;
				
	}	

	function _trade(uint256 _id, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		uint256 _feeAmount = _amountGet.mul(feePersent).div(100);

		
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
		
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
		
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);



		emit Trade(_id, _user, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, tokens[_tokenGet][feeAccount], now);
		

	}


}