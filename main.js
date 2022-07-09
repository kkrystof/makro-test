const Apify = require('apify');


Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: "https://www.makro.cz/aktualni-nabidka/aktualni-letaky" });

    // const dataset = await Apify.openDataset('dataset');

    const handlePageFunction = async ({ request, $ }) => {

        if (request.userData) {
            let catalogObject = $('script').last().html().match(/var data = (\{[\s\S]*?\});/);

            if(catalogObject){
                // json parse the variable string
                catalogObject = JSON.parse(catalogObject[1]);
                // console.log({ ...request.userData, downloadPdfUrl: catalogObject.config.downloadPdfUrl});

                // await dataset.pushData([...dataset.getData(), { ...request.userData, downloadPdfUrl: json.config.downloadPdfUrl}]);
                // await dataset.pushData({ ...request.userData, downloadPdfUrl: json.config.downloadPdfUrl});

                await Apify.setValue('OUTPUT',[...value, { ...request.userData, downloadPdfUrl: catalogObject.config.downloadPdfUrl}]); 
            }

            return
        }


        $('ul.catalog')
            .first()
            .find('a')
            .map(async (i, e) => {

                await requestQueue.addRequest({
                    url: $(e).attr('href'),
                    userData: {
                        name: $('> strong', e).text().trim(),
                        expirationDate: $('> span', e).text().replace(/\s/g, ''),
                    }
                })
                return

            }
            ).get()
            

    };

    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});