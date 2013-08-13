//Example of a JSON Object for FOOD
var foodItem = {
	"itemID": "",								//MANAGER-SIDE
	"itemName": "",							//MANAGER-SIDE
	"itemQuantity": 0,						//CLIENT-SIDE
	"itemPrice": 0,							//MANAGER-SIDE
	"availableAt": [							//MANAGER-SIDE
		"bldg00", "bldg01", "bldg02"
	]
}



//Example of a JSON Object for a particular ORDER
var order = {
	"accountName": "",					//CLIENT-SIDE
	"accountLocation": "";					//CLIENT-SIDE
	"items": [] ,								//CLIENT-SIDE
	"totalPrice": 0							//CLIENT-SIDE
}



//Takes CLIENT-SIDE orders and wraps them into a JSON Object for a particular ORDER
function generateOrder(accountName, location) {

	var order = {
		"accountName": accountName,
		"accountLocation": location,
		"items": [] ,
		"totalPrice": 0
	};

	var i = 0,
	itemVal = "itemId" + i;

	while (document.contains(itemVal) {
		item = document.getElementById(itemVal);
		if (item != null) {
			order.items.push(itemVal);
		}
		i++;
		itemVal = "itemId" + i;
	}

	var totalPrice = calculatePrice(order);
	order.totalPrice = totalPrice;
	return order;
}



//Calculate total price for a particular ORDER
function calculatePrice(order) {
	var i = 0,
	totalPrice = 0,
	tax = 0; //MANAGER-SIDE

	while(i < order.items.length) {
		totalPrice += order.items[i].itemPrice * order.items[i].itemQuantity;
		i++;
	}

	return totalPrice *tax;
}