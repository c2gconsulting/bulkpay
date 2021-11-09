import axios from 'axios';

Core.apiClient = (urlPath = "employees", responseHandler, finalHandler) => {
    const TYPE = urlPath.toUpperCase()
    /** BEGIN::: DATA IMPORT */
    console.info(`Startup ::: ${TYPE} CRON JOB IN ACTION`)
    const hasData = typeof urlPath !== 'string' ? true : false;
    const data = hasData ? urlPath.body : { employee_number: '' };
    const url = hasData ? urlPath.url : urlPath;

    axios
    .post(`http://20.73.168.4:50000/RESTAdapter/${url}`,
        data,
        {
            headers: {
                Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
                'Content-Type': 'application/json',
                Cookie: 'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
           },
            proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
        }
    )
    .then(function (response) {
        // handle success
        // console.info(JSON.stringify(response.data))
        const { data } =  response;
        // Loader.loadEmployeeData(data)
        if (responseHandler) responseHandler(data)
    })
    .catch(function (error) {
        // handle error
        const ERRORTYPE = urlPath.toUpperCase()
        console.log(`ERROR WHILE IMPORTING ${ERRORTYPE} data`)
        console.error(error)
    })
    .then(function () {
        console.log(`DONE!!! IMPORTING ${TYPE} data`)
        if (finalHandler) finalHandler()
        // always executed
    })
    /** END::: DATA IMPORT */
}
