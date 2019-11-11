import * as d3 from "d3";

async function init() {
  const data = await getDataFromCsv('dataset.csv');
  render(data);
}


function getDataFromCsv(url) {
  return new Promise((resolve, reject) => {
    d3.csv(url).then(d => {
      resolve(d);
    }).catch(e => {
      reject(e)
    })
  })
}

function render(data) {
  const width = 1000;
  const height = 600;
  const interval = 1000;
  const topN = 10;
  const margin = { left: 40, right: 60, top: 40, bottom: 0 };
  const innerHeight = height - margin.top;
  const innerWidth = width - margin.left - margin.right;
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  colorScale.domain(data.map(it => it['姓名']));
  // const t = d3.transition().duration(interval).ease(d3.easeBounce);
  const svg = d3.select('#app').append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(0, ${margin.top})`);
  const topAxis = g.append('g').attr('transform', `translate(50, 0)`);

  // yearLabel
  const yearLabel = g.append('text')
    .attr('x', innerWidth - 100)
    .attr('y', innerHeight - 80)
    .attr('class', 'yearLabel')

  let year = '2001';
  const endYear = 2019;

  const timer = d3.interval(() => {
    yearLabel.text(year);

    let tickData = data.sort((a, b) => {
      return d3.descending(+a[year], +b[year])
    }).slice(0, topN);

    /* 设置比例尺及坐标轴 --start */
    const xScale = d3.scaleLinear([0, d3.max(tickData, d => +d[year])], [0, innerWidth]);
    const yScale = d3.scaleBand(tickData.map(it => it['姓名']), [0, innerHeight]).padding(0.2);

    const xAxis = d3.axisTop(xScale).ticks(4);

    /* 设置比例尺及坐标轴 --end */

    const dataG = g.selectAll('g.bar.active').data(tickData, d => d['姓名']);
    if (dataG.size()) {
      topAxis.transition().duration(interval).call(xAxis)
        .selectAll('line')
        .attr('y2', innerHeight)
        .attr('stroke', '#ddd')
        .attr('y1', -6);

      // new bar
      const newG = dataG.enter().append('g').attr('class', 'bar active');
      newG.append('rect')
        .attr('width', d => xScale(d[year]))
        .attr('height', d => yScale.bandwidth())
        .attr('y', innerHeight)
        .attr('x', 50)
        .attr('fill', d => colorScale(d['姓名']))
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attr('y', d => yScale(d['姓名']))
      newG.append('text')
        .text(d => d3.format(',')(d[year]))
        .attr('class', 'num')
        .attr('y', d => innerHeight)
        .attr('x', d => xScale(d[year]) + 62)
        .attr('dy', d => yScale.bandwidth() / 2 + 2)
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attr('y', d => yScale(d['姓名']))

      newG.append('text')
        .text(d => d['姓名'])
        .attr('class', 'label')
        .attr('y', innerHeight)
        .attr('x', 0)
        .attr('dy', d => yScale.bandwidth() / 2 + 2)
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attr('y', d => yScale(d['姓名']))

      // upate bar
      dataG.select('rect')
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attr('width', d => xScale(d[year]))
        .attr('y', d => yScale(d['姓名']))

      dataG.select('text.num')
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .tween('text', function (d) {
          const prev = d3.select(this).text().replace(/,/g, '');
          const i = d3.interpolateRound(prev, +d[year])
          return function (t) { d3.select(this).text(d3.format(',')(i(t))) }
        })
        .attr('y', d => yScale(d['姓名']))
        .attr('x', d => xScale(d[year]) + 62)

      dataG.select('text.label')
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attr('y', d => yScale(d['姓名']))

      // delete bar
      dataG.exit().attr('class', 'bar').transition().duration(interval).ease(d3.easeLinear)
        .attr('transform', `translate(0, ${innerHeight})`).remove();
    } else {
      topAxis.call(xAxis);
      topAxis.selectAll('line').attr('y2', innerHeight).attr('stroke', '#ddd');
      topAxis.selectAll('line').attr('y1', -6);

      const res = dataG
        .enter()
        .append('g')
        .attr('class', 'bar active');

      res.append('rect')
        .attr('fill', (d, i) => {
          return colorScale(d['姓名']);
        })
        .attr('width', d => xScale(d[year]))
        .attr('height', d => yScale.bandwidth())
        .attr('y', d => yScale(d['姓名']))
        .attr('x', 50)

      res.append('text')
        .text(d => d3.format(',')(d[year]))
        .attr('class', 'num')
        .attr('y', d => yScale(d['姓名']))
        .attr('x', d => xScale(d[year]) + 62)
        .attr('dy', d => yScale.bandwidth() / 2 + 2)

      res.append('text')
        .text(d => d['姓名'])
        .attr('class', 'label')
        .attr('y', d => yScale(d['姓名']))
        .attr('x', 0)
        .attr('dy', d => yScale.bandwidth() / 2 + 2)
    }

    if (+year >= endYear) {
      timer.stop();
    } else {
      year = ++year + '';
    }
  }, interval);
}

init();
