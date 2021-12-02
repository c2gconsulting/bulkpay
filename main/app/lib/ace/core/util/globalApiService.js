import axios from 'axios';

Core.apiClient = (urlPath = "employees", responseHandler, finalHandler, errorHandler) => {
    const hasData = typeof urlPath !== 'string' ? true : false;
    const data = hasData ? urlPath.body : { employee_number: '' };
    const url = hasData ? urlPath.url : urlPath;

    const TYPE = url.toUpperCase()
    /** BEGIN::: DATA IMPORT */
    console.info(`Startup ::: ${TYPE} CRON JOB IN ACTION`)

    axios
    .post(`${process.env.OILSERV_SAP_INTEGRATION_URL}/RESTAdapter/${url}`,
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
        const ERRORTYPE = url.toUpperCase()
        console.log(`ERROR WHILE IMPORTING ${ERRORTYPE} data`)
        console.error(error)
        const err = (error.object_key || error.Errors) ? error : error.message
        if (errorHandler) errorHandler(err);
    })
    .then(function () {
        console.log(`DONE!!! IMPORTING ${TYPE} data`)
        if (finalHandler) finalHandler()
        // always executed
    })
    /** END::: DATA IMPORT */
}
