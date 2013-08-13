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



//Pull values from menu Excel file and populate array of FOOD
//THIS CODE ONLY WORKS FOR SANDWICH ZONE
function generateFoodItems(excelFile) {
	var excel = new ActiveXObject("Excel.Application");
	var excel_file = excel.Workbooks.Open(excelFile);
	var excel_seet = excel.Worksheets("Sheet1");

	var foodItemArray = [], i = 0, j = 0, location = excel_sheet.Cells(4, 1);
	
	while(i < 51) {
		
		var foodItem = {
			"itemID": i,
			"itemName":excel_sheet.Cells(i + 7, 1).Value,
			"itemPrice":excel_sheet.Cells(i + 7,3).Value,
			"availableAt": []
		}

		foodItem.availableAt.push(location);
		fooditemArray.push(foodItem);

		i++;
	}
}