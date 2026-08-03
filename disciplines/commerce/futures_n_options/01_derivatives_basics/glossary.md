@startuml
actor Trader

Trader -> Broker

Broker -> Exchange

Exchange --> Trader
@enduml