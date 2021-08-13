Hub825Explorer = {
    exportAllData: function(data, fileName) {
        var self = this;
        var csv = Papa.unparse(data);
        self._downloadCSV(csv, fileName);
    },

/*
    _downloadCSV: function(csv, fileName) {
        var blob = new Blob([csv]);
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {type: "application/csv"});
        a.download = fileName + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
*/

    _downloadCSV: function(csv, fileName) {
        let dFile = fileName + '.csv';
        var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        var csvURL =  null;
        if (window.navigator.msSaveBlob) {
            csvURL = window.navigator.msSaveBlob(csvData, dFile);
        } else {
            csvURL = window.URL.createObjectURL(csvData);
        }
        var link = document.createElement('a');
        link.href = csvURL;
        link.setAttribute('download', dFile);
        document.body.appendChild(link);    
        link.click();
        document.body.removeChild(link);  
    }

/*

            var blob = new Blob([csvString]);
        if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
            window.navigator.msSaveBlob(blob, "filename.csv");
        else
        {
            var a = window.document.createElement("a");
            a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
            a.download = "filename.csv";
            document.body.appendChild(a);
            a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
            document.body.removeChild(a);
        }
        */
}