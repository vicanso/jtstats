JTStats
======

专门记录数值型的统计，有count、average和gauge类型，通过udp的方式将统计记录收集，保存到mongodb中，由于需要将收集的数据整理（求和、取均值等），因为暂时仅支持单进程。如果遇到性能瓶颈，可以启动不同的端口，来收集不同的统计数据


启动命令
======

node app -p 6000 --host 0.0.0.0 --uri mongodb://user:pwd@host:port/stats



相关模块
======

[JTStats_client](https://github.com/vicanso/jtstats_client) node.js的stats客户端

[JTDashboard](https://github.com/vicanso/jtdashboard) 图表展示
