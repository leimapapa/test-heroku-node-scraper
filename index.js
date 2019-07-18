//https://dev.to/aurelkurtula/introduction-to-web-scraping-with-nodejs-9h2

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


var company = "oldnavy";

//Old Navy clearance url
const url = 'https://oldnavy.gap.com/products/clearance.jsp';
//women's clearance url that doesn't work
//const url = 'https://oldnavy.gap.com/browse/category.do?cid=96964';

//get today's date for writing the file
var d = new Date();
var day = d.getDate();
var month = d.getMonth();
var year = d.getFullYear();

var dateStamp = month + "-" + day + "-" + year;

//**********************************
//for determining which files need deleting
//30 days ago
var y30 = new Date();
y30.setDate(y30.getDate() - 30);

var y30day = y30.getDate();
var y30month = y30.getMonth();
var y30year = y30.getFullYear();

var y30dateStamp = y30month + "-" + y30day + "-" + y30year;
//**********************************

//asynch call
axios.get(url).then((response) => {
        if(response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html); 
            let devtoList = [];
            $('.product-card').each(function(i, elem) {
				if($(this).find('img').attr('title') != undefined){
                devtoList[i] = {
                    productID: $(this).find('img').attr('id'),
                    productDescription: $(this).find('img').attr('title'),
                    productHREF: $(this).find('a').attr('href'),
                    productImage: $(this).find('img').attr('src'),
                    productNewPrice: $(this).find('.priceDisplaySale').text(),
                    productOldPrice: $(this).find('.priceDisplayStrike').text()
                }      
				}
            });
			console.log(devtoList);
    const devtoListTrimmed = devtoList.filter(n => n != undefined )
			//write a new json file concatenating the company and date
            fs.writeFile(company + '-' + dateStamp + '.json', 
                          JSON.stringify(devtoListTrimmed, null, 4), 
                          (err)=> console.log('File successfully written!'))
    }
	
	//delete stuff older than 30 days
	//pass in the company names concatenated with the dates that correspond to 30 days ago (or more? Might take care of itself)
	deleteOldStuff30(company + '-' + y30dateStamp + '.json');
	
}, (error) => console.log(err) );



// Delete old stuff
// here's where we'd add logic to determine if something is older than 30 days
function deleteOldStuff30(fileName){
	//if it exists
	if (fs.existsSync(fileName)){
	fs.unlink(fileName, (err) => {
		if (err) throw err;
			console.log(fileName + ' was deleted');
	});
	} else {
		console.log('No file(s) deleted');
		return false;
	}
}
