## JTStats

专门记录数值型的统计，有count、average和gauge类型，通过udp的方式将统计记录收集，保存到mongodb中


### 启动命令


node app -p 6000 --host 0.0.0.0 --uri mongodb://user:pwd@host:port/stats



### 统计数据客户端收集

[JTStats_client](https://github.com/vicanso/jtstats_client) node.js的stats客户端


### 统计数据显示

[JTDashboard](https://github.com/vicanso/jtdashboard)


### demo

[demo](http://vicanso.github.io/jtstats/)
