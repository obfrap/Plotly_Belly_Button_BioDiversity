// Start with building the drop down menu.  Will see if can successfully read in name information.

var subjectID = d3.select("#selDataset");

function listSamples () {
    d3.json("samples.json").then((jsonData) => {
        var names = jsonData.names;
        names.forEach(name => {
            var row = subjectID.append("option");
            row.text(name);
            row.attr("value",name);
        });
    });
}

// Run function
listSamples();

// Create function to display metadata so it can be sorted
// Append key value pairs into variable meta
var meta = d3.select("#sample-metadata");
function displayData(metaData) {
    metaData.forEach((entry) => {
        Object.entries(entry).forEach(([key, value]) => {
            var row = meta.append("p").text(`${key}: ${value}`);
            });
        })
};


//  Create function to create plots
//
function createPlots(id) {
    // Read back in JSON file with d3
    d3.json("samples.json").then((jsonData) => {
        var sampleData = jsonData.samples;
        // console.log(sampleData);

        
        // Create internal filter functions to use in functions below
        function filterID(jsonData) {
            return jsonData.id === id;
        };

        // Integer format to use later
        function filterIDint(jsonData) {
            return jsonData.id === parseInt(id);
        };

        //  Now use internal filter functions 
        var idData = sampleData.filter(filterID);

        // Sort them high to low with b-a method, although sample_values may already be sorted high to low.  
        idData.sort(function(a, b){
            return parseInt(b.sample_values) - parseInt(a.sample_values);
        });

        // Grab otu_id from sorted data 
        idData = idData[0];
        console.log(idData);
        
        // made top ten criteria a variable for ease if wanted to change.  Checking if ordered correctly high to low and with names correctly
        // Needed to come back and use reverse() in order to display chart way i wanted (highest on top of horizontal bar chart).
        var topCriteria = 10;
        var topTenOtuIDs = idData.otu_ids.slice(0, topCriteria).reverse();
        var topTenValues = idData.sample_values.slice(0, topCriteria);
        console.log(topTenOtuIDs);
        console.log(topTenValues);

       
        // Add OTU to name and convert to string automatically by adding string
        var stringOtu_ids = topTenOtuIDs.map(function(item) {
            return "OTU "+item;
          });   

        // Create Bar Chart 
        //
        var trace1 = {
            x: idData.sample_values.slice(0, topCriteria).reverse(),
            y: stringOtu_ids,
            text: stringOtu_ids,
            name: "Top Ten OTUs",
            type: "bar",
            orientation: "h"
        };
        var barchartData = [trace1];
        Plotly.newPlot ("bar", barchartData);

        // Create Bubble Chart
        //
        var trace2 = {
            x: idData.otu_ids,
            y: idData.sample_values,
            text:idData.otu_labels,
            mode:"markers",
            marker: {
                color:idData.otu_ids,
                size:idData.sample_values,
            }
        };
        var bubblechartData = [trace2];
        Plotly.newPlot ("bubble", bubblechartData);

        // Start with building the gauge using meta_data
        var metaDatum = jsonData.metadata;
        var selectDatum = metaDatum.filter(filterIDint);
        // Clear out meta so only showing selected data
        meta.html("");
        displayData(selectDatum);

        var wash = selectDatum[0].wfreq;
        console.log(wash);
        var trace3 = {
            domain: {
                x: [0,1], 
                y: [0,1],
            },
            value: wash,
            title: {text: "Belly Button Washing Weekly Frequency"},
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: {range: [null, 9]}

            }

        };
        var gaugeData = [trace3];
        Plotly.newPlot ('gauge', gaugeData);
         
    });
   
};

// Define and build initial settings and plots

function init() {
    var selection = "940";
    createPlots(selection);
}
init();

// Define function to pull selected id and loop through functions above

d3.select("#selDataset").on("change", optionChanged);
function optionChanged(selection){
    console.log(selection);
    createPlots(selection);


}

