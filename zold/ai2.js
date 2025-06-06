const express = require("express");
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const readline = require('readline');
const fsp = require('fs').promises;
const path = require("path");
const yaml = require('js-yaml');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: '200mb' })); //works!!!
const cors = require('cors'); app.use(cors());
app.use(express.static(path.join(__dirname, '..'))); //Serve public directory
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
app.use(express.urlencoded({ extended: true }));

const PORT = 3006;

async function getStarCities() {
    const URL = "https://en.wikivoyage.org/w/api.php";
    const PARAMS = {
        action: "query",
        format: "json",
        list: "categorymembers",
        cmtitle: "Category:Star_articles",
        cmlimit: 100
    };

    try {
        const response = await axios.get(URL, { params: PARAMS });
        const data = response.data;

        const starCities = data.query.categorymembers.map(member => ({
            title: member.title,
            pageid: member.pageid
        }));

        console.log(starCities);
        return starCities;
    } catch (error) {
        console.error('Error fetching star cities:', error);
    }
}
function saveYaml(o, p) { let y = yaml.dump(o); fs.writeFileSync(p, y, 'utf8'); }

async function init() {
	let res = await getStarCities().catch(console.error);
	saveYaml(res,'_star.yaml');
	console.log('City list saved to _star.yaml');

	app.listen(PORT, () => { console.log(`Server running at http://localhost:${PORT}/`); });
}
init();


