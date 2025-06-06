const json = {
	"pages": [
		{
			"name": "page1",
			"title": "Vegetable Store",
			"elements": [
				{
					"type": "panel",
					"name": "cabbagePanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "cabbageImage",
							"title": "Cabbage",
							"description": "$2.50",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=d744127b-26e1-4b41-80ac-955b2a383621"
								}
							],
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageHeight": 200,
							"maxImageWidth": 1000,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "cabbagePrice",
							"visible": false,
							"expression": "{cabbageWeight} * 2.50"
						},
						{
							"type": "dropdown",
							"name": "cabbageWeight",
							"visibleIf": "{cabbageImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "carrotPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "carrotImage",
							"title": "Carrot",
							"description": "$1.20",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=aaca9982-af66-4840-869e-fc2fc0b34bde"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "carrotPrice",
							"visible": false,
							"expression": "{carrotWeight} * 1.2"
						},
						{
							"type": "dropdown",
							"name": "carrotWeight",
							"visibleIf": "{carrotImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "pumpkinPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "pumpkinImage",
							"title": "Pumpkin",
							"description": "$3.00",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=26c5abf2-7eb2-4437-963e-03d49d8822d7"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "pumpkinPrice",
							"visible": false,
							"expression": "{pumpkinWeight} * 3.00"
						},
						{
							"type": "dropdown",
							"name": "pumpkinWeight",
							"visibleIf": "{pumpkinImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "pepperPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "pepperImage",
							"title": "Pepper",
							"description": "$4.50",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=68135162-1d85-4f5f-ba7b-3130274dc663"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "pepperPrice",
							"visible": false,
							"expression": "{pepperWeight} * 4.5"
						},
						{
							"type": "dropdown",
							"name": "pepperWeight",
							"visibleIf": "{pepperImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "cornPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "cornImage",
							"title": "Corn",
							"description": "$1.50",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=44c0fbcb-cf53-451f-a8f2-864dd7213d8e"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "cornPrice",
							"visible": false,
							"expression": "{cornWeight} * 1.5"
						},
						{
							"type": "dropdown",
							"name": "cornWeight",
							"visibleIf": "{cornImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "potatoPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "potatoImage",
							"title": "Potato",
							"description": "$0.90",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=51d53a3a-4d94-4b6e-b2fa-a48e7e7b44d4"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "potatoPrice",
							"visible": false,
							"expression": "{potatoWeight} * 0.9"
						},
						{
							"type": "dropdown",
							"name": "potatoWeight",
							"visibleIf": "{potatoImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "tomatoPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "tomatoImage",
							"title": "Tomato",
							"description": "$3.80",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=4c947e02-393b-4d18-b95b-77909de7ddeb"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "tomatoPrice",
							"visible": false,
							"expression": "{tomatoWeight} * 3.8"
						},
						{
							"type": "dropdown",
							"name": "tomatoWeight",
							"visibleIf": "{tomatoImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "panel",
					"name": "lemonPanel",
					"elements": [
						{
							"type": "imagepicker",
							"name": "lemonImage",
							"title": "Lemon",
							"description": "$2.20",
							"choices": [
								{
									"value": "image",
									"imageLink": "https://api.surveyjs.io/private/Surveys/files?name=a6de77e1-65de-4af5-bf09-3b8125bc140b"
								}
							],
							"colCount": 1,
							"imageFit": "cover",
							"minImageHeight": 200,
							"maxImageWidth": 1000,
							"maxImageHeight": 200,
							"multiSelect": true
						},
						{
							"type": "expression",
							"name": "lemonPrice",
							"visible": false,
							"expression": "{lemonWeight} * 2.20"
						},
						{
							"type": "dropdown",
							"name": "lemonWeight",
							"visibleIf": "{lemonImage} = ['image']",
							"titleLocation": "hidden",
							"choices": [1, 2, 3, 4, 5],
							"placeholder": "Select weight (kg)",
							"allowClear": false
						}
					],
					"startWithNewLine": false,
					"minWidth": "320px"
				},
				{
					"type": "html",
					"name": "totalPrice",
					"html": "<h4 style=\"font-weight:bold;margin-top:24px;margin-bottom:16px;text-align:right\">Total: ${total}</h4>"
				}
			]
		}
	],
	"calculatedValues": [
		{
			"name": "total",
			"expression": "{cabbagePrice} + {carrotPrice} + {pumpkinPrice} + {pepperPrice} + {cornPrice} + {tomatoPrice} + {potatoPrice} + {lemonPrice}",
			"includeIntoResult": true
		}
	],
	"showQuestionNumbers": "off",
	"questionTitleLocation": "bottom",
	"clearInvisibleValues": "onHidden",
	"completeText": "PLACE ORDER",
	"widthMode": "responsive"
};
const survey = new Survey.Model(json);
survey.applyTheme(SurveyTheme.FlatLight);
survey.onComplete.add((sender, options) => {
	console.log(JSON.stringify(sender.data, null, 3));
});

$("#surveyElement").Survey({ model: survey });