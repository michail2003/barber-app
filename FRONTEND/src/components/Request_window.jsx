import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import "dayjs/locale/sq";
import { io } from 'socket.io-client'
import { barberRequests, sendRequest, RequestAnswer } from '../Api/Requests';
const Request_window = () => {
    const [barberID, setBarberID] = useState(localStorage.getItem('id'));
    const [requests, setRequests] = useState([]);
    const [reqIndex, setReqIndex] = useState(0);

    function handleNext() {
        if (reqIndex < requests.length - 1) {
            setReqIndex(reqIndex + 1);
        }
    }

    function handleBack() {
        if (reqIndex > 0) {
            setReqIndex(reqIndex - 1);
        }
    }

    function barber_answer(answer) {
        RequestAnswer(requests[reqIndex]?._id, answer);
    }
    useEffect(() => {
        if (barberID) {
            // initial load
            barberRequests(barberID)
                .then(data => setRequests(data.requests.reverse()))
                .catch(error => console.error('Error fetching barber requests:', error))

            // socket connection
            const socket = io('http://localhost:5000', {
                query: { barberId: barberID }
            })

            // listen for new requests
            socket.on('new-request', (request) => {
                setRequests(prev => [request, ...prev])
            })

            // cleanup on unmount
            return () => {
                socket.off('new-request')
                socket.disconnect()
            }
        }
    }, [barberID]);
    return (
        <>
            {requests.length > 0 &&
                <div className='bg-black/80 absolute w-full h-full gap-10 flex flex-col sm:flex-row justify-center items-center z-10 p-2'>
                    <button className={`hidden sm:block px-4 py-2 text-2xl text-center bg-indigo-800 text-white ${reqIndex === 0 ? 'invisible' : ''}`} onClick={() => handleBack()}>back</button>
                    <div class="w-full sm:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div class="p-6 pb-4">
                            <div class="flex items-center justify-between">
                                <div class="flex flex-col">
                                    <h3 class="text-xl font-bold text-gray-900 leading-tight">{requests[reqIndex].userid.name}</h3>
                                    <p class="text-sm text-gray-500 font-medium">{requests[reqIndex].userid.ph_number}</p>
                                </div>
                                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                                    {requests[reqIndex].status}
                                </span>
                            </div>
                        </div>

                        <div class="px-6 py-4 bg-gray-50 space-y-4">
                            <div class="flex justify-center items-center">
                                <div class="text-right">
                                    <p class="text-xs text-gray-400 uppercase font-bold tracking-tight">Total Price</p>
                                    <p class="text-lg font-bold text-indigo-700">{requests[reqIndex].total_price} Lek</p>
                                </div>
                            </div>

                            <div>
                                <p class="text-xs text-gray-400 uppercase font-bold tracking-tight mb-1">Services</p>
                                {requests[reqIndex].services.map((service) => (
                                    <p class="text-gray-700 text-sm leading-relaxed font-bold flex items-center gap-2">
                                        • {service.name}
                                    </p>
                                ))}
                            </div>

                            <div class="flex items-center space-x-2 pt-2 border-t border-gray-200 justify-between">
                                <div>
                                    <h3 className='text-right'>{dayjs(requests[reqIndex].start.split("T")[0]).locale("sq")
                                        .format("dddd D MMMM")}</h3>
                                    <div className='flex items-center gap-2 justify-center'>
                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p class="text-lg font-semibold text-gray-600">
                                            {requests[reqIndex]?.start.split("T")[1].slice(0, 5)} — {requests[reqIndex]?.end.split("T")[1].slice(0, 5)}
                                        </p>

                                    </div>
                                </div>

                                <p class="text-lg font-bold text-indigo-700">{requests[reqIndex].duration} min</p>

                            </div>
                        </div>

                        <div class="p-4 flex flex-col sm:flex-row gap-2">
                            <button class="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 order-1 sm:order-2"
                                onClick={() => barber_answer("accepted")}>
                                Accept
                            </button>
                            <button class="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 order-2 sm:order-3">
                                Modify
                            </button>
                            <button class="flex-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 font-semibold py-3 px-4 rounded-lg transition duration-200 order-3 sm:order-1"
                                onClick={() => barber_answer("cancelled")}>
                                Reject
                            </button>
                        </div>
                    </div>


                    <div className='flex justify-between w-full sm:hidden'>
                        <button className={`px-4 py-2 text-2xl text-center bg-indigo-800 text-white ${reqIndex === 0 ? 'invisible' : ''}`} onClick={() => handleBack()}>back</button>
                        <button className={`px-4 py-2 text-2xl text-center bg-indigo-800 text-white ${reqIndex + 1 === requests.length ? 'invisible' : ''}`} onClick={() => handleNext()}>next</button>
                    </div>
                    <button className={`hidden sm:block px-4 py-2 text-2xl text-center bg-indigo-800 text-white ${reqIndex + 1 === requests.length ? 'invisible' : ''}`} onClick={() => handleNext()}>next</button>
                </div>
            }
        </>
    )
}

export default Request_window