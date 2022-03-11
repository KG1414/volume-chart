import React, { useState, useEffect } from "react";
import callAPI from "./utils";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [latestVolume, setLatestVolume] = useState(0);

  useEffect(() => {
    fetchData().then((chartData) => {
      setIsLoading(false);
      initChart(chartData);
      setLatestVolume(parseFloat(chartData.volumes[chartData.volumes.length - 1]).toFixed(2));
    });
    const timerID = setInterval(() => {
      fetchData().then((chartData) => {
        updateChart(chartData);
        setLatestVolume(parseFloat(chartData.volumes[chartData.volumes.length - 1]).toFixed(2));
      });
    }, 1000 * 30);
    return () => {
      clearInterval(timerID);
    };
  }, []);

  const fetchData = async () => {
    let data = { index: [], price: [], volumes: [] };
    let result = await callAPI("https://api.coingecko.com/api/v3/coins/woo-network/market_chart/range?vs_currency=usd&from=1604071697&to=1646926185");
    for (const item of result.total_volumes) {
      data.index.push(item[0]);
      data.volumes.push(item[1]);
    }
    return data;
  };

  const initChart = (data) => {
    let trace_volumes = {
      name: "Volume ($)",
      x: data.index.map((t) => new Date(t)),
      y: data.volumes,
      xaxis: "x",
      yaxis: "y1",
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "blue", size: 3 },
    };
    let layout = {
      autosize: true,
      height: "100%",
      margin: {
        l: 50,
        r: 20,
        t: 35,
        pad: 3,
      },
      showlegend: false,
      xaxis: {
        domain: [1, 1],
        anchor: "y2",
      },
      yaxis: {
        domain: [0.1, 1],
        anchor: "x",
      },
      yaxis2: {
        showticklabels: false,
        domain: [0, 0.1],
        anchor: "x",
      },
      grid: {
        roworder: "bottom to top",
      },
    };
    let config = { responsive: true };
    let series = [trace_volumes];  // [trace_volumes, trace_price];
    // eslint-disable-next-line no-undef
    Plotly.newPlot("chart", series, layout, config);
  };

  const updateChart = (data) => {
    document.querySelector("#last-price").classList.remove("animate__fadeIn");
    let trace_volumes = {
      x: [data.index.map((t) => new Date(t))],
      y: [data.volumes],
    };

    // eslint-disable-next-line no-undef
    Plotly.update("chart", trace_volumes, {}, 0);
    document.querySelector("#last-price").classList.add("animate__fadeIn");
  };

  const internationalNumberFormat = new Intl.NumberFormat('en-US')

  return (
    <div className='px-3 mt-1'>
      {isLoading ? (
        <h6 className='value animate__animated animate__flash animate__slow text-center text-primary'> loading ...</h6>
      ) : (
        <>
          <h2 id='last-price' className='text-center text-primary animate__animated'>
            Current 24hr Volume ${internationalNumberFormat.format(latestVolume)}
          </h2>
          <div id='chart' className='p-0 m-0'></div>
        </>
      )}
    </div>
  );
}

export default App;
