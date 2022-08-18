const Apify = require('apify');


Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: "https://www.makro.cz/aktualni-nabidka/aktualni-letaky" });

    const handlePageFunction = async ({ request, $ }) => {

        if (request.userData) {
            let catalogObject = $('script').last().html().match(/var data = (\{[\s\S]*?\});/);
            
            if(catalogObject){
                catalogObject = JSON.parse(catalogObject[1]);
                await Apify.pushData({ ...request.userData, downloadPdfUrl: catalogObject.config.downloadPdfUrl});

                return
            }
        }

        
        $('li.catalog')
        .find('a')
        .map(async (i, e) => {
            await requestQueue.addRequest({
                url: $(e).attr('href'),
                userData: {
                    name: $(e).find('strong').text().trim(),
                    expirationDate: $(e).find('span').text().replace(/\s/g, ''),
                
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

    const dataSet = await Apify.openDataset();
    const output = await dataSet.map(i => i);

    await Apify.setValue('OUTPUT', output);


});