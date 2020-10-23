import { tokens, EVM_REVERT} from './helper'

const Token = artifacts.require('./Token')

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Token',([deployer,receiver,exchange]) => {
	const name = 'DApp Token'
	const symbol = 'DAPP'
	const decimals = '18'
	const totalSupply = tokens(1000)
	let token

	beforeEach(async () => {
		token = await Token.new()
	})

	describe('deployment', () => {
		it('tracks the name', async () => {
			const result = await token.name()
			result.should.equal(name)
		})

		it('tracks the symbol', async () => {
			const result = await token.symbol()
			result.should.equal(symbol)
		})

		it('tracks the decimals', async () => {
			const result = await token.decimals()
			result.toString().should.equal(decimals)
		})

		it('tracks the totalSupply', async () => {
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply.toString())
		})
	})

	describe('sending tokens success',() => {

		let result
		let amount

		beforeEach(async () => {
			amount = tokens(50)
			result = await token.transfer(receiver, amount, {from: deployer})
		})

		it('transfers token balances',async () => {
			let balanceOf
		
			balanceOf = await token.balanceOf(deployer)
			balanceOf.toString().should.equal(tokens(950).toString())
			balanceOf = await token.balanceOf(receiver)
			balanceOf.toString().should.equal(tokens(50).toString())
		})

		it('transfer event',async () => {
			const log = result.logs[0]
			log.event.should.eq('Transfer')

			const event = log.args
			event.from.should.eq(deployer,'from is correct')
			event.to.should.eq(receiver,'to is correct')
			event.value.toString().should.eq(amount.toString(),'value is correct')
			//console.log(event)
		})
	})

	describe('sending tokens failure',() =>  {


		it('rejects invalid recipients',async () => {
			const amount = tokens(50)
			await token.transfer('0x0', amount,{ from: deployer})
				.should.be.rejected
		})

		it('rejects insufficient balances',async() => {
			const amount_max = tokens(10000)
			await token.transfer(receiver, amount_max, {from: deployer})
				.should.be.rejectedWith(EVM_REVERT)

			const amount_min = tokens(10)
			await token.transfer(deployer, amount_min, {from: receiver})
				.should.be.rejectedWith(EVM_REVERT)
		})

	})

	describe('approve tokens ',() => {
		let amount
		let result

		describe('success',() => {
			
			beforeEach(async () => {
				amount = tokens(100)
				result = await token.approve(exchange, amount, {from: deployer})
				
			})

			it('allocates an allowence for delegated token spending on exchange',async () => {
				const allowence = await token.allowence(deployer, exchange);
				allowence.toString().should.eq(amount.toString())
			})

			it('emit an Approval event',async () => {
			const log = result.logs[0]
			log.event.should.eq('Approval')

			const event = log.args
			event.ownner.should.eq(deployer,'ownner is correct')
			event.exchange.should.eq(exchange,'exchange is correct')
			event.value.toString().should.eq(amount.toString(),'value is correct')
			//console.log(event)
		})


		})


		describe('failure', () => {
			it('rejects invalid spender',async () => {
				await token.approve(0x0, amount, {from: deployer}).should.be.rejected
			})
		})
	})

	describe('delegated token transfers', () => {
		let amount
		let result

		beforeEach( async ()=> {
			amount = tokens(100)
			await token.approve(exchange, amount, { from: deployer})
		})

		describe('success', () => {
			
			beforeEach( async () => {
				
				result = await token.transferFrom(deployer, receiver, amount, {from: exchange})
			})

			it('transfer from spender', async () => {
				let balances

				balances = await token.balanceOf(deployer)
				balances.toString().should.eq(tokens(900).toString())
				balances = await token.balanceOf(receiver) 	
				balances.toString().should.eq(tokens(100).toString())
			})

			it('resets the allowence',async () => {
				const log = result.logs[0]
				log.event.should.eq('Transfer')

				const event = log.args
				event.from.should.eq(deployer,'from is correct')
				event.to.should.eq(receiver,'to is correct')
				event.value.toString().should.eq(amount.toString(),'value is correct')
				//console.log(event)
			})

			it('delegated allowence', async () => {
				const allowence = await token.allowence(deployer, exchange)
				allowence.toString().should.eq('0')
			})
		})

		describe('failure', () => {

			it('rejects insufficient amounts', async ()=> {
				amount = tokens(10000)
				await token.transferFrom(deployer, receiver, amount, {from: exchange})
					.should.be.rejected
			})

			it('rejects invalid receipients', async () => {
				await token.transferFrom(deployer, 0x0, amount, {from: exchange})
					.should.be.rejected
			})
		})
		

	})
})
