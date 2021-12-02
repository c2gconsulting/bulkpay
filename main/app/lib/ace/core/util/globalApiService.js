import axios from 'axios';

Core.apiClient = (urlPath = "employees", responseHandler, finalHandler, errorHandler) => {
    const hasData = typeof urlPath !== 'string' ? true : false;
    const data = hasData ? urlPath.body : { employee_number: '' };
    const url = hasData ? urlPath.url : urlPath;

    const TYPE = url.toUpperCase()
    /** BEGIN::: DATA IMPORT */
    console.info(`Startup ::: ${TYPE} CRON JOB IN ACTION`)

    const port_number = process.env.OILSERV_SAP_INTEGRATION_URL.split('http://20.73.168.4:')[1]

    axios
    .post(`${process.env.OILSERV_SAP_INTEGRATION_URL}/RESTAdapter/${url}`,
        data,
        {
            headers: {
                Authorization: process.env.OILSERV_SAP_INTEGRATION_AUTH_KEY,
                'Content-Type': 'application/json',
                Cookie: process.env.OILSERV_SAP_INTEGRATION_COOKIE_API_KEY
           },
            proxy: { protocol: 'http',host: '20.73.168.4',port: port_number || 50000 }
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
