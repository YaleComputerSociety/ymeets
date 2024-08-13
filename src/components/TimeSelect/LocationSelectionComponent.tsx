import * as React from 'react'
import './locationSelectionComponent.css'
import Select from 'react-dropdown-select'
import { useEffect, useState, useRef } from 'react'

export function LocationSelectionComponent (props: any) {
  const locations: string[] = props.locations
  const options = locations.map(loc => ({
    value: loc,
    label: loc
  }))

  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // @ts-expect-error
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // @ts-expect-error
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize) }
  }, [])

  return (
        <div
            style={{ width: '50%' }}
            ref={containerRef}
        >
            <Select
                style={{ height: '100%', zIndex: 1000 }}
                multi
                create={false}
                options={options}
                clearOnSelect={false}
                values={[]}
                onChange={(values: any) => {
                  props.update(values.map((val: any) => val.value))
                }}
                contentRenderer={({ props, state }) => {
                  let widthUsed = 0
                  const itemStyles = {
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    marginRight: '5px',
                    padding: '2px 5px',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }
                  const itemsToRender = state.values.filter((item) => {
                    const itemWidth = 100
                    if (widthUsed + itemWidth <= containerWidth) {
                      widthUsed += itemWidth
                      return true
                    }
                    return false
                  })

                  return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minHeight: '36px',
                          padding: '8px',
                          fontSize: '16px'
                        }}>
                            {itemsToRender.length === 0 && (
                                <span style={{ color: 'gray', fontStyle: 'italic' }}>
                                    Choose Locations
                                </span>
                            )}
                            {itemsToRender.map((item, index) => (
                                // @ts-expect-error
                                <div key={index} style={itemStyles}>
                                    {item.label}
                                </div>
                            ))}
                            {state.values.length > itemsToRender.length && (
                                <span style={{ paddingLeft: '5px' }}>...</span>
                            )}
                        </div>
                  )
                }}
                noDataRenderer={() => (
                    <div className="p-2 text-center">No location options set :(</div>
                )}
            />
        </div>
  )
}
