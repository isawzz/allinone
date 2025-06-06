const axios = require('axios');

// Function to get members of a category
async function getCategoryMembers(category, limit = 100, continueToken = '') {
    const URL = "https://en.wikivoyage.org/w/api.php";
    const PARAMS = {
        action: "query",
        format: "json",
        list: "categorymembers",
        cmtitle: category,
        cmlimit: limit,
        cmcontinue: continueToken
    };

    try {
        const response = await axios.get(URL, { params: PARAMS });
        return response.data;
    } catch (error) {
        console.error(`Error fetching members for category ${category}:`, error);
        return null;
    }
}

// Function to get details of a page
async function getPageDetails(pageId) {
    const URL = "https://en.wikivoyage.org/w/api.php";
    const PARAMS = {
        action: "query",
        format: "json",
        pageids: pageId,
        prop: "categories",
        cllimit: "max"
    };

    try {
        const response = await axios.get(URL, { params: PARAMS });
        return response.data.query.pages[pageId].categories;
    } catch (error) {
        console.error(`Error fetching details for page ${pageId}:`, error);
        return null;
    }
}

// Function to get star cities
async function getStarCities() {
    const starCategory = "Category:Star_articles";
    const citiesCategory = "Category:Cities";
    const limit = 25;

    const starData = await getCategoryMembers(starCategory, limit);
    if (!starData) return;

    const starCities = [];

    for (const member of starData.query.categorymembers) {
        const pageDetails = await getPageDetails(member.pageid);
        if (!pageDetails) continue;

				console.log(pageDetails);
        const isCity = pageDetails.some(category => category.title === citiesCategory);
        if (isCity) {
            starCities.push({
                title: member.title,
                pageid: member.pageid
            });
        }
    }

    console.log(starCities);
    return starCities;
}

getStarCities().catch(console.error);
