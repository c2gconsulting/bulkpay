Core.flatMap = flatMap = (data) => data.flatMap((datum)=> Array.isArray(datum) ? flatMap(datum): datum);

