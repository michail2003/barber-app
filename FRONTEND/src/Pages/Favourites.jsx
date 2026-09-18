import { useState, useEffect } from "react"
import { favourite_toggle, favourites_list } from '../Api/Shops'

const Favourites = () => {
  const [name, setName] = useState('koli')
  const [test, setTest] = useState()
  const [api_results, setApi_results] = useState([])
  const [selected_el, setSelected_el] = useState()
  
  const elementi = api_results[selected_el]
  console.log('elementi',elementi)

  function change_name_to_keli() {

    if (name === 'koli') {
      setName('keli')
    } else {
      setName('koli')
    }

  }
  console.log('var_results', api_results)
  console.log('selected el', selected_el)

  async function thirja_api() {
    const te_dhenat = await favourites_list()
    console.log('api', te_dhenat)
    setApi_results(te_dhenat)
  }

  useEffect(() => {
    thirja_api()
  }, [])

  return (
    <>
      <div className="flex gap-10 m-10 items-center">
        <h1 className="text-2xl">{name}</h1>

        {
          api_results.length > 0 && (
            api_results.map((fav, ind) => (

              <div>
                <h1>{fav.name}, {fav.address}, {ind}</h1>
                <button
                  className="px-4 py-2 bg-red-100 cursor-pointer hover:bg-red-500 hover:text-white transition-all"
                  onClick={() => setSelected_el(ind)}> selektoje </button>
              </div>


            ))
          )
        }
        <button className="px-4 py-2 bg-blue-100 cursor-pointer hover:bg-blue-500 hover:text-white transition-all"
          onClick={() => change_name_to_keli()}
        >
          change name
        </button>

        <h1>{test}</h1>
      </div>

      <input
        type="text"
        onChange={(e) => setName(e.target.value)}
        placeholder={`enter new name, current name: ${name}`}
        className="w-1/4 ml-10 border-2 border-blue-200 py-2 px-4" />

    </>

  )
}

export default Favourites