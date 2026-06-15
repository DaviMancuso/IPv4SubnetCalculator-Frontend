# 🌐 IPv4 Subnet Calculator - Frontend

Interface web da Calculadora de Sub-redes IPv4 desenvolvida para consumir uma API REST construída com Spring Boot.

## 📖 Sobre o Projeto

O objetivo deste projeto é fornecer uma interface simples, intuitiva e responsiva para realizar cálculos de sub-redes IPv4.

A aplicação permite que o usuário informe um endereço IP e um prefixo CIDR para obter informações detalhadas sobre a rede.

---

## 🚀 Funcionalidades

### Cálculos Disponíveis

* Endereço de Rede
* Broadcast
* Primeiro Host Válido
* Último Host Válido
* Quantidade de Hosts
* Máscara de Rede
* Máscara Wildcard
* Tipo da Rede
* Representação Binária da Rede

### Recursos da Interface

* Interface Responsiva
* Integração com API REST
* Tratamento de Erros
* Copiar Resultados
* Exportação para CSV
* Atualização em Tempo Real

---

## 🖼️ Exemplo

### Entrada

```text
IP: 192.168.1.50
CIDR: 26
```

### Resultado

```text
Rede: 192.168.1.0
Broadcast: 192.168.1.63
Primeiro Host: 192.168.1.1
Último Host: 192.168.1.62
Hosts: 62
Máscara: 255.255.255.192
Wildcard: 0.0.0.63
Tipo da Rede: Privada
```

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Fetch API
* Git
* GitHub
* Vercel

---

## 🔗 API

Este frontend consome a API:

**IPv4SubnetCalculator-API**

Tecnologias utilizadas na API:

* Java 21
* Spring Boot
* Maven
* Railway

---

## 👨‍💻 Autor

Desenvolvido por Davi Mancuso como projeto de estudo para praticar integração entre Frontend e Backend utilizando Java, Spring Boot e conceitos de Redes de Computadores.

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de aprendizado.
