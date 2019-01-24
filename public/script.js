// BUDGET CONTROLLER
const budgetController = (() => {

	class Expense {
		constructor(id, description, value) {
			this.id = id,
			this.description = description,
			this.value = value,
			this.percentage = -1
		}
	}

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100)
		} else {
			this.percentage = -1
		}
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage
	}

	class Income {
		constructor(id, description, value) {
			this.id = id,
			this.description = description,
			this.value = value
		}
	}

	const calculateTotal = (type) => {
		let sum = 0
		data.allItems[type].forEach((cur) => {
			sum += cur.value
		})
		data.totals[type] = sum
	}

	const data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		butdget: 0,
		percentage: -1
	}

	return {
		addItem: (type, des, val) => {
			let newItem, ID
			// create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1
			} else {
				ID = 0
			}
			
			// Create new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val)
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val)
			}
			// push it into our data structure
			data.allItems[type].push(newItem)
			// return the new element
			return newItem
		},

		deleteItem: (type, id) => {
			let ids, index

			// id = 6
			// data.allItems[type][id]
			// ids = [1 2 4 6 8]
			// index = 3

			ids = data.allItems[type].map((current) => {
				return current.id
			})

			index = ids.indexOf(id)

			if (index !== -1) {
				data.allItems[type].splice(index, 1)
			}

		},

		calculateBudget: () => {

			// calculate total income and expenses
			calculateTotal('exp')
			calculateTotal('inc')

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp

			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
			} else {
				data.percentage = -1
			}

			// Expense = 100 and income 100, spent 33.333% = 100/200 = 0.333 * 100
		},

		calculatePercentages: () => {

			/*
			a=20
			b=10
			c=40
			income = 100
			a=20/100=20%
			b=10/100=10%
			c=40/100=40%
			*/
			data.allItems.exp.forEach((cur) => {
				cur.calcPercentage(data.totals.inc)
			})
		},

		getPercentages: () => {
			const allPerc = data.allItems.exp.map((cur) => {
				return cur.getPercentage()
			})
			return allPerc
		},

		getBudget: () => {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: () => {
			console.log(data)
		}
	}
})()

// UI CONTROLLER
const uiController = (() => {

	const DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	}

	const formatNumber = (num, type) => {
		let numSplit, int, dec
		/*
		+ or - before number
		exactly 2 decimal points
		comma separaging the thousands

		2310.4567 -> 2,310.46
		2000 -> 2,000.00
		*/

		num = Math.abs(num)
		num = num.toFixed(2)

		numSplit = num.split('.')

		int = numSplit[0]

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3) // input 23210, output 23,210
		}

		dec = numSplit[1]

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
	}

	const nodeListForEach = (list, callback) => {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i)
		}
	}

	return {
		getInput: () => {
			return {
				type: document.querySelector(DOMstrings.inputType).value,  // will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},

		addListItem: (obj, type) => {
			let html, newHtml, element
			// create html string with placeholder text

			if (type === 'inc') {
				element = DOMstrings.incomeContainer
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else {
				element = DOMstrings.expensesContainer
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			// replace the placeholder text with actual data
			newHtml = html.replace('%id%', obj.id)
			newHtml = newHtml.replace('%description%', obj.description)
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

			// insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
		},

		deleteListItem: (selectorId) => {
			const element = document.getElementById(selectorId)
			element.parentNode.removeChild(element)


		},

		clearFields: () => {
			let fields, fieldsArr
			
			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue)
		
			fieldsArr = Array.prototype.slice.call(fields)

			fieldsArr.forEach((current, index, array) => {
				current.value = ''
			})

			fieldsArr[0].focus()

		},

		displayBudget: (obj) => {
			let type
			obj.budget > 0 ? type = 'inc' : type = 'exp'

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.budget, 'inc')
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.budget, 'exp')

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + `%`
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---'
			}

		},

		displayPercentages: (percentages) => {

			const fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

			nodeListForEach(fields, (current, index) => {

				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%'
				} else {
					current.textContent = '---'
				}
			})
		},

		displayMonth: () => {

			const now = new Date()

			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

			const month = now.getMonth()

			const year = now.getFullYear()

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year

		},

		changedType: () => {

			const fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue)
		
			nodeListForEach(fields, (cur) => {
				cur.classList.toggle('red-focus')
			})

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

		},



		getDOMstrings: () => {
			return DOMstrings
		}
	}

})()


// GLOBAL APP CONTROLLER
const controller = ((budgetCtrl, uiCtrl) => {

	const setupEventListeners = () => {

		const DOM = uiCtrl.getDOMstrings()

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

		document.addEventListener('keypress', (event) => {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem()
			}
		})

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

		document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType)

	}

	const updateBudget = () => {
		
		// 1. caculate the budget
		budgetCtrl.calculateBudget()
		
		// 2. return the budget
		const budget = budgetCtrl.getBudget()

		// 3. display the budget on the UI
		uiCtrl.displayBudget(budget)
	}

	const updatePercentages = () => {

		// 1. calculate percentages
		budgetCtrl.calculatePercentages()

		// 2. read percentages from the budget controller
		const percentages = budgetCtrl.getPercentages()

		// 3. update the ui with the new percentages
		uiCtrl.displayPercentages(percentages)
	}

	const ctrlAddItem = () => {
		let input, newItem

		// 1. get the field input data
		input = uiCtrl.getInput()

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value)

			// 3. add the new item to the user interface
			uiCtrl.addListItem(newItem, input.type)

			// 4. clear the fields
			uiCtrl.clearFields()

			// 5. calculate and update budget
			updateBudget()

			// 6. calculate and update percentages
			updatePercentages()
		}
	}

	const ctrlDeleteItem = (event) => {
		let itemId, splitId, type, id

		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id

		if (itemId) {

			// inc-1
			splitId = itemId.split('-')
			type = splitId[0]
			id = parseInt(splitId[1])

			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type, id)

			// 2. delete item from the UI
			uiCtrl.deleteListItem(itemId)

			// 3. update and show the new budget
			updateBudget()

			// 4. calculate and update percentages
			updatePercentages()
		}
	}

	return {
		init: () => {
			console.log('Application has started.')
			uiCtrl.displayMonth()
			uiCtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			})
			setupEventListeners()
		}
	}

})(budgetController, uiController)

controller.init()